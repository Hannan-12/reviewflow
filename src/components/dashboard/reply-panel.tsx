import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { TemplatePicker } from './template-picker';

interface ReplyPanelProps {
  reviewId: string;
  profileId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  onReplySubmitted?: () => void;
}

export function ReplyPanel({
  reviewId,
  profileId,
  reviewerName,
  rating,
  comment,
  onReplySubmitted,
}: ReplyPanelProps) {
  const [replyText, setReplyText] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch AI suggestion
  const handleGetAiSuggestion = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/reviews/${reviewId}/ai-suggestion?profileId=${profileId}`
      );

      if (!response.ok) {
        throw new Error('Failed to generate suggestion');
      }

      const data = await response.json();
      setAiSuggestion(data.suggestion);
      setShowSuggestion(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestion');
    } finally {
      setLoading(false);
    }
  };

  // Accept AI suggestion
  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
      setReplyText(aiSuggestion);
      setShowSuggestion(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyText: replyText.trim(),
          aiAccepted: aiSuggestion === replyText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }

      setSuccess(true);
      setReplyText('');
      setAiSuggestion(null);
      setTimeout(() => setSuccess(false), 3000);
      onReplySubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white space-y-4">
      <div>
        <h3 className="font-semibold text-sm">Reply to {reviewerName}</h3>
        <p className="text-xs text-gray-500 mt-1">
          {rating}★ Review: "{comment}"
        </p>
      </div>

      {/* AI Suggestion Section */}
      <div className="space-y-2">
        {!showSuggestion ? (
          <Button
            onClick={handleGetAiSuggestion}
            disabled={loading || showSuggestion}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Generating suggestion...
              </>
            ) : (
              '✨ Get AI Suggestion'
            )}
          </Button>
        ) : aiSuggestion && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-2">
            <p className="text-sm text-gray-700">{aiSuggestion}</p>
            <div className="flex gap-2">
              <Button
                onClick={handleAcceptSuggestion}
                size="sm"
                variant="default"
                className="flex-1"
              >
                Accept
              </Button>
              <Button
                onClick={() => setShowSuggestion(false)}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Rewrite Manually
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Template picker + Reply Text Area */}
      <div className="space-y-1.5">
        <div className="flex justify-end">
          <TemplatePicker onSelect={(content) => setReplyText(content)} />
        </div>
        <textarea
          ref={textAreaRef}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write your reply here..."
          className="w-full p-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
        />
      </div>

      {/* Character count */}
      <div className="text-xs text-gray-500">
        {replyText.length} / 1000 characters
      </div>

      {/* Error/Success messages */}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && (
        <div className="text-sm text-green-600">Reply posted successfully!</div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmitReply}
          disabled={submitting || !replyText.trim()}
          className="flex-1"
        >
          {submitting ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            'Post Reply'
          )}
        </Button>
        <Button
          onClick={() => setReplyText('')}
          variant="outline"
          className="flex-1"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
