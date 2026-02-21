'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Flex, Text, SmartLink, Icon } from '@/once-ui/components';
import styles from './SpotifyNowPlaying.module.scss';

type Song = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
};

const NowPlaying = () => {
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch('/api/now-playing', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data.title) {
            setSong(data);
          } else {
            setSong(null);
          }
        } else {
          setSong(null);
        }
      } catch (error) {
        setSong(null);
        console.error('Error fetching now playing track:', error);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 90000); // Poll every 90 seconds

    return () => clearInterval(interval);
  }, []);

  if (!song || !song.title) {
    return (
       <Flex gap="s" vertical="center">
        <Icon name="spotify" size="l" onBackground="neutral-weak" />
        <Text variant="body-default-m" onBackground="neutral-weak">
          Not playing
        </Text>
      </Flex>
    )
  }

  return (
    <SmartLink 
      href={song.songUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{textDecoration: 'none', width: '100%'}}
    >
      <Flex gap="s" vertical="center">
        {song.albumImageUrl && (
          <Image 
            src={song.albumImageUrl} 
            alt={song.album || 'Album Art'}
            width={48}
            height={48}
            style={{ borderRadius: 'var(--radius-s)'}}
          />
        )}
        <Flex direction="column" style={{ minWidth: 0, flexGrow: 1 }}>
           <Flex as="div" vertical="center" gap="s">
            <Text as="p" variant="body-strong-m" onBackground="neutral-strong" className={styles.truncate}>
              {song.title}
            </Text>
            {song.isPlaying && (
              <Icon 
                name="spotify" 
                size="m" 
                onBackground="brand-strong" 
                className={styles.spotifyIconPlaying}
              />
            )}
          </Flex>
          <Text as="p" variant="body-default-m" onBackground="neutral-weak" className={styles.truncate}>
            {song.artist}
          </Text>
        </Flex>
      </Flex>
    </SmartLink>
  );
};

export default NowPlaying; 