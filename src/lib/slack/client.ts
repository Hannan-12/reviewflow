import axios from 'axios';

interface SlackMessage {
  channel?: string;
  text?: string;
  blocks?: Array<any>;
}

export async function sendSlackNotification(
  webhookUrl: string,
  data: {
    profileName: string;
    reviewerName: string;
    rating: number;
    comment: string;
    reviewUrl: string;
    aiSuggestion?: string;
  }
) {
  const color = data.rating >= 4 ? '#36a64f' : data.rating >= 3 ? '#fdb71a' : '#dc4e41';

  const blocks: Array<any> = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `⭐ New Review: ${data.profileName}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Reviewer:*\n${data.reviewerName}`,
        },
        {
          type: 'mrkdwn',
          text: `*Rating:*\n${'⭐'.repeat(data.rating)} (${data.rating}/5)`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Comment:*\n${data.comment}`,
      },
    },
  ]

  if (data.aiSuggestion) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*AI Suggested Reply:*\n_${data.aiSuggestion}_`,
      },
    })
    blocks.push({ type: 'divider' })
  }

  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Reply in GoHighReview',
          emoji: true,
        },
        url: data.reviewUrl,
        style: color === '#36a64f' ? undefined : 'danger',
      },
    ],
  })

  const payload: SlackMessage = { blocks };

  try {
    const response = await axios.post(webhookUrl, payload);
    return response.data;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    throw error;
  }
}
