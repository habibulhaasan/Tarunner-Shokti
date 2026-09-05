"use client";

import { useSearchParams } from "next/navigation";
import DashboardOverviewTab from "../../components/dashboard/DashboardOverviewTab";
import MyProfileTab from "../../components/dashboard/MyProfileTab";
import DonationsTab from "../../components/dashboard/DonationsTab";
import DirectoryTab from "../../components/dashboard/DirectoryTab";
import FavoritesTab from "../../components/dashboard/FavoritesTab";
import NotificationsTab from "../../components/dashboard/NotificationsTab";
import AboutTab from "../../components/dashboard/AboutTab";
import ContributeTab from "../../components/dashboard/ContributeTab";
import CommitteeTab from "../../components/dashboard/CommitteeTab";
import MemosTab from "../../components/dashboard/MemosTab";
import EventsTab from "../../components/dashboard/EventsTab";
import ArchiveTab from "../../components/dashboard/ArchiveTab";

const TAB_COMPONENTS = {
  dashboard: DashboardOverviewTab,
  profile: MyProfileTab,
  donations: DonationsTab,
  directory: DirectoryTab,
  notifications: NotificationsTab,
  favorites: FavoritesTab,
  about: AboutTab,
  contribute: ContributeTab,
  committee: CommitteeTab,
  memos: MemosTab,
  events: EventsTab,
  archive: ArchiveTab,
};

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const Active = TAB_COMPONENTS[tab] || DashboardOverviewTab;

  return <Active />;
}