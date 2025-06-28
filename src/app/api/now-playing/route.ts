import { getNowPlaying, getRecentlyPlayed } from '@/lib/spotify';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const nowPlayingResponse = await getNowPlaying();

  if (nowPlayingResponse.status === 204 || nowPlayingResponse.status > 400) {
    // If nothing is playing, try to get the recently played track
    const recentlyPlayedResponse = await getRecentlyPlayed();
    if (recentlyPlayedResponse.ok) {
      const recentlyPlayed = await recentlyPlayedResponse.json();
      const lastTrack = recentlyPlayed.items[0].track;

      return NextResponse.json({
        isPlaying: false,
        title: lastTrack.name,
        artist: lastTrack.artists.map((_artist: { name: string }) => _artist.name).join(', '),
        album: lastTrack.album.name,
        albumImageUrl: lastTrack.album.images[0].url,
        songUrl: lastTrack.external_urls.spotify,
      });
    }
    return NextResponse.json({ isPlaying: false });
  }

  const song = await nowPlayingResponse.json();

  if (song.item === null) {
    return NextResponse.json({ isPlaying: false });
  }

  return NextResponse.json({
    isPlaying: song.is_playing,
    title: song.item.name,
    artist: song.item.artists.map((_artist: { name: string }) => _artist.name).join(', '),
    album: song.item.album.name,
    albumImageUrl: song.item.album.images[0].url,
    songUrl: song.item.external_urls.spotify,
  });
} 