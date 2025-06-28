const GITHUB_USERNAME = 'efekurucay'; // <-- Buraya kendi GitHub kullanıcı adınızı yazın
const LATEST_ACTIVITY_ENDPOINT = `https://api.github.com/users/${GITHUB_USERNAME}/events/public`;

export const getLatestActivity = async () => {
  try {
    const url = `${LATEST_ACTIVITY_ENDPOINT}?t=${new Date().getTime()}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // Gerekirse buraya bir GitHub Personal Access Token ekleyebilirsiniz
        // 'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch GitHub activity:', response.statusText);
      return null;
    }

    const events = await response.json();

    if (!events || events.length === 0) {
      console.error('No GitHub events found.');
      return null;
    }
    
    const latestEvent = events[0];

    const activity: {
      type: string;
      repo: string;
      repoUrl: string;
      createdAt: string;
      message?: string;
    } = {
      type: latestEvent.type.replace('Event', ''),
      repo: latestEvent.repo.name,
      repoUrl: `https://github.com/${latestEvent.repo.name}`,
      createdAt: latestEvent.created_at,
    };

    if (latestEvent.type === 'PushEvent' && latestEvent.payload.commits?.length > 0) {
      activity.type = 'commit';
      activity.message = latestEvent.payload.commits[0].message;
    }

    return activity;
  } catch (error) {
    console.error('Error in getLatestActivity:', error);
    return null;
  }
}; 