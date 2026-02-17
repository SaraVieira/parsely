import { Globe, Loader2, Minus, Plus, Terminal } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  fetchFromUrl,
  type HeaderEntry,
  parseCurlCommand,
} from '@/lib/server/fetch-url';
import { useParsleyStore } from '@/lib/stores/parsley-store';

type FetchUrlDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export function FetchUrlDialog({ open, onOpenChange }: FetchUrlDialogProps) {
  const { setJsonInput } = useParsleyStore();

  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<string>('GET');
  const [headers, setHeaders] = useState<Array<HeaderEntry>>([]);
  const [body, setBody] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setUrl('');
    setMethod('GET');
    setHeaders([]);
    setBody('');
    setShowAdvanced(false);
    setLoading(false);
    setError(null);
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);

    // Auto-detect cURL commands pasted into the URL field
    const parsed = parseCurlCommand(value);
    if (parsed) {
      setUrl(parsed.url);
      setMethod(parsed.method);
      if (parsed.headers.length > 0) {
        setHeaders(parsed.headers);
        setShowAdvanced(true);
      }
      if (parsed.body) {
        setBody(parsed.body);
        setShowAdvanced(true);
      }
    }
  };

  const addHeader = () => {
    setHeaders((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  };

  const updateHeader = (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => {
    setHeaders((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)),
    );
  };

  const handleFetch = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFromUrl({
        data: {
          url: trimmedUrl,
          method,
          headers: headers.filter((h) => h.key.trim()),
          body,
        },
      });

      if (result.status >= 400) {
        setError(`HTTP ${result.status} ${result.statusText}`);
        return;
      }

      setJsonInput(JSON.stringify(result.data, null, 2));
      onOpenChange(false);
      resetState();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch from URL.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          resetState();
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="size-4" />
            Fetch from URL
          </DialogTitle>
          <DialogDescription>
            Fetch JSON from any URL. Paste a URL or a cURL command.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL + Method row */}
          <div className="space-y-2">
            <Label htmlFor="fetch-url">URL</Label>
            <div className="flex gap-2">
              {showAdvanced && (
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-[100px] font-mono text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HTTP_METHODS.map((m) => (
                      <SelectItem
                        key={m}
                        value={m}
                        className="font-mono text-xs"
                      >
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Input
                id="fetch-url"
                placeholder="https://api.example.com/data or paste a cURL command"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFetch();
                  }
                }}
                className="flex-1 font-mono text-xs"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAdvanced ? 'Hide' : 'Show'} advanced options (method,
              headers, body)
            </button>
          </div>

          {/* Advanced: Headers */}
          {showAdvanced && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Headers</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={addHeader}
                >
                  <Plus className="mr-1 size-3" />
                  Add
                </Button>
              </div>
              {headers.map((header, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: headers are added/removed, not reordered
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={header.key}
                    onChange={(e) => updateHeader(i, 'key', e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                  <Input
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => updateHeader(i, 'value', e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeHeader(i)}
                  >
                    <Minus className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Advanced: Body */}
          {showAdvanced && method !== 'GET' && (
            <div className="space-y-2">
              <Label htmlFor="fetch-body" className="text-xs">
                Body
              </Label>
              <textarea
                id="fetch-body"
                placeholder='{"key": "value"}'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full rounded-md border bg-transparent px-3 py-2 font-mono text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          )}

          {/* Error */}
          {error && <p className="text-xs text-destructive">{error}</p>}

          {/* Fetch button */}
          <Button
            onClick={handleFetch}
            disabled={!url.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Terminal className="mr-2 size-3.5" />
                Fetch
              </>
            )}
          </Button>

          <p className="text-[10px] text-muted-foreground">
            Request is made server-side to bypass CORS restrictions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
