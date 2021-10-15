import React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import createGitClient from './configure-git-client';

const client = createGitClient();

function Dashboard() {
  const [repos, setRepos] = React.useState([]);
  const [expanded, setExpanded] = React.useState([]);

  const fetchRepos = async () => {
    try {
      const url = '/user/repos';
      const { data } = await client.request(url, {
        page: 1,
        per_page: 100,
        visibility: 'all',
      });
      const response = data.map((elements) => ({
        ...elements,
        child: [],
      }));

      setRepos(response);
    } catch (e) {
      alert(e.message);
    }
  };

  const fetchPullRequest = async (payload, status) => {
    if (status) {
      return;
    }

    try {
      const url = `/repos/${payload.owner.login}/${payload.name}/pulls`;
      const { data } = await client.request(url, {
        page: 1,
        per_page: 100,
        state: 'all',
      });
      const cloneObject = [...repos];
      const index = cloneObject.findIndex((repo) => repo.name === payload.name);

      if (index > -1) {
        cloneObject[index].child = data.map((elements) => ({
          ...elements,
          child: [],
        }));
      }

      setRepos(cloneObject);
    } catch (e) {
      alert(e.message);
    }
  };

  const fetchFiles = async (payload, request, status) => {
    if (status) {
      return;
    }
    try {
      const url = `/repos/${payload.owner.login}/${payload.name}/pulls/${request.number}/files`;
      const { data } = await client.request(url, {
        page: 1,
        per_page: 100,
      });
      const cloneObject = [...repos];
      const repoIndex = cloneObject.findIndex((repo) => repo.name === payload.name);

      if (repoIndex > -1) {
        const prIndex = cloneObject[repoIndex].child?.findIndex((pullRequest) => pullRequest.number === request.number);

        if (prIndex > -1) {
          cloneObject[repoIndex].child[prIndex].files = data;
        }
      }

      setRepos(cloneObject);
    } catch (e) {
      alert(e.message);
    }
  };

  const onRootElementClick = () => {
    const isExists = [...expanded].includes('user-level');

    if (!isExists) {
      fetchRepos();
      setExpanded([...expanded, 'user-level']);
    }
  };

  const onPullRequestClick = (payload) => {
    const isExists = [...expanded].includes(payload.id.toString());

    if (!isExists) {
      fetchPullRequest(payload);
      setExpanded([...expanded, payload.id.toString()]);
    }
  };

  const onFilesClick = (repo, pullRequest) => {
    const name = pullRequest.id.toString();
    const isExists = [...expanded].includes(name);

    if (!isExists) {
      fetchFiles(repo, pullRequest);
      setExpanded([...expanded, name]);
    }
  };

  return (
    <>
      <Container maxWidth="sm">
        <Typography gutterBottom align='left' marginBottom="40px">
          Click on username to Navigate through the Git repository system
        </Typography>
        <TreeView
          aria-label="Git repo navigator system"
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          expanded={expanded}
          onNodeToggle={(e, nodeIds) => setExpanded(nodeIds)}
        >
          <TreeItem
            nodeId="user-level"
            label="imbudhiraja"
            onClick={onRootElementClick}
          >
            {repos?.map((repo) => (
              <TreeItem
                label={repo.name}
                key={repo.id}
                nodeId={repo.id.toString()}
                onClick={() => onPullRequestClick(repo)}
              >
                {repo?.child?.map((pullRequest) => (
                  <TreeItem
                    label={`${pullRequest.title} (${pullRequest.state})`}
                    key={pullRequest.id}
                    nodeId={pullRequest.id.toString()}
                    onClick={() => onFilesClick(repo, pullRequest)}
                  >
                    {pullRequest?.files?.map((file) => (
                      <TreeItem
                        label={`${file.filename} (status = ${file.status})`}
                        key={`${pullRequest.id}-${file.filename}-(status = ${file.status})`}
                        nodeId={`${repo.id}-${pullRequest.id}-${file.sha}`}
                      />
                    ))}
                  </TreeItem>
                ))}
              </TreeItem>
            ))}
          </TreeItem>
        </TreeView>
      </Container>
    </>
  );
}

export default Dashboard;
