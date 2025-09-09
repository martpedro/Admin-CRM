// ==============================|| TYPES - KANBAN  ||============================== //

export interface KanbanProfile {
  id: string;
  name: string;
  avatar: string;
  time?: string;
}

export interface KanbanComment {
  id: string;
  comment: string;
  profileId: string;
  profile?: KanbanProfile;
  time?: string;
}

export interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  dueDate?: Date | string;
  image?: boolean;
  storyId?: string;
  commentIds?: string[];
  comments?: KanbanComment[];
  profile?: KanbanProfile;
  assign?: string;
  columnId?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  itemIds: string[];
  items?: KanbanItem[];
}

export interface KanbanUserStory {
  id: string;
  title: string;
  description?: string;
  acceptance?: string;
  priority?: string;
  dueDate?: Date | string;
  columnId?: string;
  itemIds?: string[];
  items?: KanbanItem[];
  commentIds?: string[];
  comments?: KanbanComment[];
  profile?: KanbanProfile;
  assign?: string;
}
