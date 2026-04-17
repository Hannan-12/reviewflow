import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader, Sparkles, RotateCcw } from 'lucide-react';
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

  const handleGetAiSuggestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/reviews/${reviewId}/ai-suggestion?profileId=${profileId}`
      );
      if (!response.ok) throw new Error('Failed to generate suggestion');
      const data = await response.json();
      setAiSuggestion(data.suggestion);
      setShowSuggestion(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestion');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
      setReplyText(aiSuggestion);
      setShowSuggestion(false);
    }
  };

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
      if (!response.ok) throw new Error('Failed to submit reply');
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
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          Reply to {reviewerName}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {rating}★ &ldquo;{comment}&rdquo;
        </p>
      </div>

      {/* AI Suggestion */}
      <div className="space-y-2">
        {!showSuggestion ? (
          <Button
            onClick={handleGetAiSuggestion}
            disabled={loading}
            variant="outline"
            size="sm"
            className="w-full border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
          >
            {loading ? (
              <>
                <Loader className="w-3.5 h-3.5 mr-2 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Get AI Suggestion
              </>
            )}
          </Button>
        ) : aiSuggestion && (
          <div className="rounded-lg border border-primary/20 bg-primary/8 p-3 space-y-2.5">
            <p className="text-sm text-foreground leading-relaxed">{aiSuggestion}</p>
            <div className="flex gap-2">
              <Button onClick={handleAcceptSuggestion} size="sm" className="flex-1 h-7 text-xs">
                Use this
              </Button>
              <Button
                onClick={() => setShowSuggestion(false)}
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Rewrite
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Template picker + Textarea */}
      <div className="space-y-1.5">
        <div className="flex justify-end">
          <TemplatePicker onSelect={(content) => setReplyText(content)} />
        </div>
        <textarea
          ref={textAreaRef}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write your reply here…"
          rows={4}
          className="w-full rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Character count */}
      <p className="text-xs text-muted-foreground text-right -mt-1">
        {replyText.length} / 1000
      </p>

      {/* Error / Success */}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {success && <p className="text-xs text-emerald-500">Reply posted successfully!</p>}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmitReply}
          disabled={submitting || !replyText.trim()}
          className="flex-1"
          size="sm"
        >
          {submitting ? (
            <>
              <Loader className="w-3.5 h-3.5 mr-2 animate-spin" />
              Posting…
            </>
          ) : 'Post Reply'}
        </Button>
        <Button
          onClick={() => setReplyText('')}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
