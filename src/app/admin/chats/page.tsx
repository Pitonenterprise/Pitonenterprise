import { getMessages, listSessions } from "@/lib/store";

export default function AdminChatsPage() {
  const sessions = listSessions();
  return (
    <div>
      <h2 className="serif text-2xl mb-6">Chat sessions ({sessions.length})</h2>
      {sessions.length === 0 ? (
        <p className="text-sm text-black/55">
          No chat sessions yet. Open the storefront and chat with the Saree
          Assistant — sessions appear here.
        </p>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => {
            const msgs = getMessages(s.id);
            const lastUserMsg = [...msgs].reverse().find((m) => m.role === "user");
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-black/5 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono text-xs text-black/55">{s.id}</p>
                    <p className="text-xs text-black/55 mt-0.5">
                      Started {new Date(s.started_at).toLocaleString()} ·{" "}
                      {msgs.length} messages
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {s.escalated_to_human && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        Escalated
                      </span>
                    )}
                    {s.led_to_purchase && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Purchased
                      </span>
                    )}
                  </div>
                </div>
                {lastUserMsg && (
                  <p className="text-sm text-black/75 italic">
                    &ldquo;{lastUserMsg.content.slice(0, 200)}{lastUserMsg.content.length > 200 ? "…" : ""}&rdquo;
                  </p>
                )}
                <details className="mt-3">
                  <summary className="text-xs text-[var(--brand)] cursor-pointer">
                    Show full transcript
                  </summary>
                  <ul className="mt-3 space-y-2 text-sm">
                    {msgs.map((m) => (
                      <li key={m.id} className="flex gap-2">
                        <span className={`text-xs uppercase font-semibold w-16 shrink-0 ${
                          m.role === "user" ? "text-[var(--brand)]" : "text-black/55"
                        }`}>
                          {m.role}
                        </span>
                        <span className="text-black/80">{m.content}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
