"use client";

import { Mail } from "lucide-react";
import { defaultAvatarFor } from "../../lib/photoUtils";
import { useCommitteeMembers } from "../../lib/committee";
import { PhoneAction } from "../common/PhoneAction";

function avatarFor(profile) {
  return profile.photo?.useDefault === false && profile.photo?.base64
    ? profile.photo.base64
    : defaultAvatarFor(profile.gender);
}

export default function CommitteeTab() {
  const { members, ready } = useCommitteeMembers();

  return (
    <div>
      <h1>Committee</h1>
      <p className="step-sub">The current management committee.</p>

      {!ready && <p className="helper-text">Loading…</p>}
      {ready && members.length === 0 && <p className="helper-text">No committee roles have been assigned yet.</p>}

      <div className="directory-grid" style={{ marginTop: 18 }}>
        {members.map((m) => (
          <div key={m.id} className="directory-card">
            <div className="directory-card-top">
              <img
                src={avatarFor(m)}
                alt=""
                width={44}
                height={44}
                style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
              <div>
                <div className="directory-card-name">{m.name}</div>
                <span className="committee-role-badge">{m.committeeRole.title}</span>
              </div>
            </div>
            <div className="directory-card-body">
              {m.department && (
                <div className="directory-card-meta">{m.department}{m.session ? ` · ${m.session}` : ""}</div>
              )}
              {m.email && (
                <div className="directory-card-meta"><Mail size={14} />{m.email}</div>
              )}
              {m.phone && (
                <div className="directory-card-meta">
                  <PhoneAction phone={m.phone} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
