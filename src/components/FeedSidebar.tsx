/**
 * FeedSidebar — supporting lists beside the feed on wide screens: the groups
 * the member belongs to, the newest jobs and recent surveys. Every list comes
 * from existing data and is hidden when it is empty.
 */
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderBy, limit, where } from "firebase/firestore";
import { Briefcase, BarChart3, Users } from "lucide-react";
import { useAuth } from "../App";
import { useCollection } from "../hooks/useFirestore";

function Panel({ title, icon, moreTo, moreLabel, children }: { title: string; icon: ReactNode; moreTo: string; moreLabel: string; children: ReactNode }) {
  return (
    <section className="bg-bg-card border border-border-main rounded-lg">
      <h2 className="flex items-center gap-2 px-4 pt-4 pb-2 text-[14px] font-semibold text-text-heading">
        {icon}
        {title}
      </h2>
      <div className="px-2 pb-1">{children}</div>
      <Link to={moreTo} className="block px-4 py-2.5 border-t border-border-main text-[13px] font-medium text-primary hover:underline">
        {moreLabel}
      </Link>
    </section>
  );
}

const rowClass = "block w-full text-left px-2 py-2 rounded-md hover:bg-bg-main";

export function FeedSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const uid = user?.uid || "";

  const { data: memberships } = useCollection<any>("group_members", [where("userUid", "==", uid)], !!uid);
  const joinedIds = memberships.filter((m: any) => m.status === "approved").map((m: any) => m.groupId);
  const { data: groups } = useCollection<any>("groups", [], joinedIds.length > 0);
  const myGroups = groups.filter((g: any) => joinedIds.includes(g.id) && g.status !== "pending").slice(0, 4);

  const { data: jobs } = useCollection<any>("jobs", [orderBy("createdAt", "desc"), limit(3)]);
  const { data: surveys } = useCollection<any>("surveys", [orderBy("createdAt", "desc"), limit(3)]);

  if (myGroups.length === 0 && jobs.length === 0 && surveys.length === 0) return null;

  return (
    <aside aria-label="Groups, jobs and surveys" className="hidden min-[1100px]:block space-y-4 sticky top-32">
      {myGroups.length > 0 && (
        <Panel title="Your groups" icon={<Users className="w-4 h-4 text-text-body" strokeWidth={1.75} />} moreTo="/groups" moreLabel="All groups">
          {myGroups.map((g: any) => (
            <Link key={g.id} to={`/groups/${g.id}`} className={rowClass}>
              <span className="block text-[14px] font-medium text-text-heading truncate">{g.name}</span>
              <span className="block text-[13px] text-text-body">
                {g.memberCount || 1} {(g.memberCount || 1) === 1 ? "member" : "members"}
              </span>
            </Link>
          ))}
        </Panel>
      )}

      {jobs.length > 0 && (
        <Panel title="Newest jobs" icon={<Briefcase className="w-4 h-4 text-text-body" strokeWidth={1.75} />} moreTo="/jobs" moreLabel="All jobs">
          {jobs.map((j: any) => (
            <button key={j.id} type="button" onClick={() => navigate("/jobs", { state: { openJobId: j.id } })} className={rowClass}>
              <span className="block text-[14px] font-medium text-text-heading truncate">{j.title}</span>
              <span className="block text-[13px] text-text-body truncate">
                {[j.companyName, j.location].filter(Boolean).join(" · ")}
              </span>
            </button>
          ))}
        </Panel>
      )}

      {surveys.length > 0 && (
        <Panel title="Recent surveys" icon={<BarChart3 className="w-4 h-4 text-text-body" strokeWidth={1.75} />} moreTo="/surveys" moreLabel="All surveys">
          {surveys.map((s: any) => (
            <button key={s.id} type="button" onClick={() => navigate("/surveys", { state: { highlightId: s.id } })} className={rowClass}>
              <span className="block text-[14px] font-medium text-text-heading line-clamp-2">{s.question}</span>
              <span className="block text-[13px] text-text-body">
                {s.totalVotes || 0} {(s.totalVotes || 0) === 1 ? "response" : "responses"}
              </span>
            </button>
          ))}
        </Panel>
      )}
    </aside>
  );
}
