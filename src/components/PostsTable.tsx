import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Menu,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconCalendar,
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconPhoto,
  IconInfoCircle,
  IconHash,
  IconAt,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import { useState } from "react";
import { InstagramPost, PostStatus } from "../types";
import { getPostStatus } from "../utils/postUtils";

interface StatusBadgeProps {
  post: InstagramPost;
}

const StatusBadge = ({ post }: StatusBadgeProps) => {
  const status = getPostStatus(post);
  const colors: Record<PostStatus, string> = {
    draft: "gray",
    scheduled: "blue",
    posted: "green",
    all: "gray",
  };

  return (
    <Badge color={colors[status]} variant="light" size="sm" fullWidth>
      {status}
    </Badge>
  );
};

interface PostsTableProps {
  posts: InstagramPost[];
  loading: boolean;
  onViewDetails: (post: InstagramPost) => void;
  onCopyPost: (post: InstagramPost) => void;
  onEditPost: (post: InstagramPost) => void;
  onMarkAsPosted: (post: InstagramPost) => void;
}

const PostsTable = ({
  posts,
  loading,
  onViewDetails,
  onCopyPost,
  onEditPost,
  onMarkAsPosted,
}: PostsTableProps) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("asc");

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getDateForSorting = (post: InstagramPost): Date | null => {
    if (post.postedAt) return post.postedAt;
    if (post.scheduledFor) return post.scheduledFor;
    return null;
  };

  const handleSort = () => {
    if (sortOrder === null) {
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortOrder(null);
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortOrder === null) return 0;

    const dateA = getDateForSorting(a);
    const dateB = getDateForSorting(b);

    // Handle null dates - put them at the end
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    const comparison = dateA.getTime() - dateB.getTime();
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Drafts & Scheduled</Title>
          <Text size="sm" c="dimmed">
            {posts.length} posts total
          </Text>
        </Group>

        <ScrollArea h="calc(100vh - 286px)" w="100%">
          <Table
            striped
            highlightOnHover
            styles={{
              table: { height: 600, maxHeight: 600, overflowY: "auto" },
              thead: {
                position: "sticky",
                top: 0,
                backgroundColor: "Scrollbar",
              },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th></Table.Th>
                <Table.Th>Caption</Table.Th>
                <Table.Th>Notes</Table.Th>
                <Table.Th>Hashtags</Table.Th>
                <Table.Th>Files</Table.Th>
                <Table.Th>Collaborators</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={handleSort}
                >
                  <Group
                    gap="xs"
                    justify="center"
                    style={{ flexWrap: "nowrap" }}
                  >
                    <Text>Scheduled/Posted</Text>
                    {sortOrder === "asc" && <IconChevronUp size="0.8rem" />}
                    {sortOrder === "desc" && <IconChevronDown size="0.8rem" />}
                  </Group>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    <Text c="dimmed">Loading posts...</Text>
                  </Table.Td>
                </Table.Tr>
              ) : posts.length === 0 ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    <Text c="dimmed">
                      No Drafts Created, create your first draft.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                sortedPosts.map((post) => (
                  <Table.Tr key={post.id}>
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="light" color="gray" size="sm">
                            <IconDotsVertical size="0.9rem" />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown styles={{ dropdown: { width: 240 } }}>
                          <Menu.Item
                            leftSection={<IconInfoCircle size="1rem" />}
                            onClick={() => onViewDetails(post)}
                          >
                            View details
                          </Menu.Item>

                          <Menu.Item
                            leftSection={<IconEdit size="1rem" />}
                            onClick={() => onEditPost(post)}
                            color="orange"
                          >
                            Edit post
                          </Menu.Item>

                          {!post.isPosted && (
                            <Menu.Item
                              leftSection={<IconCheck size="1rem" />}
                              onClick={() => onMarkAsPosted(post)}
                              color="green"
                            >
                              Mark as posted
                            </Menu.Item>
                          )}

                          <Menu.Divider />

                          <Menu.Item
                            leftSection={<IconCopy size="1rem" />}
                            onClick={() => onCopyPost(post)}
                          >
                            Copy caption & hashtags
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={2} w={240}>
                        {post.caption}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={2} c="dimmed" w={240}>
                        {post.notes || "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td width={100}>
                      <Tooltip
                        label={
                          post.hashtags.length > 0
                            ? post.hashtags.map((tag) => `#${tag}`).join(" ")
                            : "No hashtags"
                        }
                        multiline
                        maw={300}
                      >
                        <Group
                          gap="xs"
                          style={{ cursor: "pointer", flexWrap: "nowrap" }}
                        >
                          <IconHash size="1rem" />
                          <Text size="sm">{post.hashtags.length}</Text>
                        </Group>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td width={100}>
                      <Tooltip
                        label={
                          post.fileName.length > 0
                            ? post.fileName.join(", ")
                            : "No files"
                        }
                        multiline
                        maw={300}
                      >
                        <Group
                          gap="xs"
                          style={{ cursor: "pointer", flexWrap: "nowrap" }}
                        >
                          <IconPhoto size="1rem" />
                          <Text size="sm">{post.fileName.length}</Text>
                        </Group>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td width={120}>
                      <Tooltip
                        label={
                          post.peopleToTag && post.peopleToTag.length > 0
                            ? post.peopleToTag
                                .map((person) => `@${person}`)
                                .join(", ")
                            : "No people to tag"
                        }
                        multiline
                        maw={300}
                      >
                        <Group
                          gap="xs"
                          style={{ cursor: "pointer", flexWrap: "nowrap" }}
                        >
                          <IconAt size="1rem" />
                          <Text size="sm">{post.peopleToTag?.length || 0}</Text>
                        </Group>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td width={140}>
                      <StatusBadge post={post} />
                    </Table.Td>
                    <Table.Td width={160}>
                      <Group gap="xs">
                        {post.scheduledFor && !post.isPosted && (
                          <Group gap="xs" style={{ flexWrap: "nowrap" }}>
                            <IconCalendar size="0.8rem" />
                            <Text size="sm" style={{ whiteSpace: "nowrap" }}>
                              {formatDate(post.scheduledFor)}
                            </Text>
                          </Group>
                        )}
                        {post.postedAt && (
                          <Text size="sm" c="green">
                            {formatDate(post.postedAt)}
                          </Text>
                        )}
                        {!post.scheduledFor && !post.postedAt && (
                          <Text size="sm" c="dimmed">
                            Draft
                          </Text>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    </Card>
  );
};

export default PostsTable;
