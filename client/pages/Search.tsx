import Layout from "@/components/neo10/Layout";
import { useState, useEffect, memo, useCallback } from "react";
import { Search as SearchIcon, User, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getToken } from "@/lib/auth";

interface SearchResult {
  type: "user" | "post";
  id: string;
  name?: string;
  avatar?: string;
  content?: string;
  author?: string;
}

const SearchResultItem = memo(({ result }: { result: SearchResult }) => {
  if (result.type === "user") {
    return (
      <Link
        to={`/u/${result.id}`}
        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/60 transition-colors"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={result.avatar} alt={result.name} />
          <AvatarFallback>{result.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-sm">{result.name}</div>
          <div className="text-xs text-muted-foreground">User</div>
        </div>
        <User className="w-4 h-4 text-muted-foreground" />
      </Link>
    );
  }

  return (
    <div className="p-3 rounded-lg border hover:bg-muted/60 transition-colors">
      <div className="flex items-start gap-2 mb-2">
        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm line-clamp-2">{result.content}</p>
          <p className="text-xs text-muted-foreground mt-1">{result.author}</p>
        </div>
      </div>
    </div>
  );
});

SearchResultItem.displayName = "SearchResultItem";

function SearchContent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/feed?search=${encodeURIComponent(q)}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      ).catch(() => null);

      if (!res || !res.ok) return;
      const data = await res.json();

      const searchResults: SearchResult[] = (data.posts || [])
        .filter(
          (p: any) =>
            p.content?.toLowerCase().includes(q.toLowerCase()) ||
            p.user_name?.toLowerCase().includes(q.toLowerCase())
        )
        .map((p: any) => ({
          type: "post" as const,
          id: p.id,
          content: p.content?.substring(0, 100),
          author: p.user_name,
        }));

      setResults(searchResults.slice(0, 10));
    } catch (err) {
      console.warn("Search error:", err);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, people..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </div>

        {searching ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          </div>
        ) : query.trim() ? (
          results.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </p>
              <div className="space-y-2">
                {results.map((result) => (
                  <SearchResultItem key={`${result.type}-${result.id}`} result={result} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-8 text-center">
              <p className="text-muted-foreground">No results found for "{query}"</p>
            </div>
          )
        ) : (
          <div className="rounded-xl border bg-card p-8 text-center">
            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">Start typing to search</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default memo(SearchContent);
