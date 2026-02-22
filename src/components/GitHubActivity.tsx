'use client';

import { useEffect, useState } from 'react';
import { Flex, Text, SmartLink, Icon, Skeleton } from '@/once-ui/components';
import styles from './GitHubActivity.module.scss';
type Activity = {
  type: string;
  repo: string;
  repoUrl: string;
  message?: string;
  createdAt?: string;
};

function formatDistanceToNow(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = Math.max(0, now - then);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
}

const GitHubActivity = () => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchActivity = async () => {
      try {
        const res = await fetch('/api/github', { cache: 'no-store' });
        if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
        const data = (await res.json()) as Activity;
        if (!cancelled) {
          setActivity(data);
          setError(false);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchActivity();
    const refresh = setInterval(fetchActivity, 300000);

    return () => {
      cancelled = true;
      clearInterval(refresh);
    };
  }, []);

  useEffect(() => {
    if (activity?.createdAt) {
      const update = () => setTimeAgo(formatDistanceToNow(activity.createdAt as string));
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

    if (loading) {
      return <Skeleton shape="block" style={{ width: '100%', height: '48px', borderRadius: 'var(--radius-s)' }} />;
    }

    if (!activity) return null;

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
