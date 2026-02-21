'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Flex, Text, SmartLink, Icon, Skeleton } from '@/once-ui/components';
import styles from './GitHubActivity.module.scss';
import { formatDistanceToNow } from 'date-fns';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then((res) => res.json());

const GitHubActivity = () => {
  const { data: activity, error } = useSWR('/api/github', fetcher, {
    refreshInterval: 300000,
  });

  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (activity?.createdAt) {
      const update = () => setTimeAgo(formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }));
      update();
      const interval = setInterval(update, 60000);
      return () => clearInterval(interval);
    }
  }, [activity]);

  const renderContent = () => {
    if (error) {
      return (
        <Flex gap="s" vertical="center">
          <Icon name="github" size="l" onBackground="neutral-weak"/>
          <Text onBackground="neutral-weak" size="s">Could not load activity.</Text>
        </Flex>
      );
    }

    if (!activity) {
      return <Skeleton shape="block" style={{ width: '100%', height: '48px', borderRadius: 'var(--radius-s)' }} />;
    }

    let icon: React.ComponentProps<typeof Icon>['name'] = 'star';
    let text: React.ReactNode = 'Starred a repository';

    switch (activity.type) {
      case 'commit':
        icon = 'gitCommit';
        text = 'Pushed a commit to';
        break;
      case 'Create':
        icon = 'plus';
        text = 'Created a new repository';
        break;
      case 'Issues':
        icon = 'issueOpened';
        text = 'Opened an issue in';
        break;
      case 'star':
      default:
        icon = 'star';
        text = 'Starred a repository';
        break;
    }
    
    return (
      <Flex direction="column" gap="xs">
        <Flex gap="s" vertical="start">
          <Icon name={icon} onBackground="neutral-weak" style={{flexShrink: 0, marginTop: '2px'}}/>
          <Flex direction="column" gap="xs">
            <Text onBackground="neutral-strong" size="s" wrap="balance">
                {text}{' '}
                <SmartLink href={activity.repoUrl} target="_blank" className={styles.link}>
                    {activity.repo}
                </SmartLink>
            </Text>
            {activity.message && (
                <Text onBackground="neutral-weak" size="xs" className={styles.message}>
                    {activity.message}
                </Text>
            )}
          </Flex>
        </Flex>
        {timeAgo && <Text onBackground="neutral-weak" size="xs" style={{alignSelf: 'flex-end'}}>{timeAgo}</Text>}
      </Flex>
    );
  };

  return <>{renderContent()}</>;
};

export default GitHubActivity; 