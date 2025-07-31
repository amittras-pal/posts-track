import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Menu,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconAt,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconHash,
  IconInfoCircle,
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
    <Badge color={colors[status]} variant="light" size="sm">
      {status}
      {post.scheduledFor ? `: ${formatDate(post.scheduledFor)}` : ""}
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

const formatDate = (date: Date | null | undefined) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const PostsTable = ({
  posts,
  loading,
  onViewDetails,
  onCopyPost,
  onEditPost,
  onMarkAsPosted,
}: PostsTableProps) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("asc");

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
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Drafts & Scheduled</Title>
        <Group gap="xs">
          <Button
            variant="light"
            size="xs"
            onClick={handleSort}
            leftSection={
              sortOrder === "asc" ? (
                <IconChevronUp size="0.8rem" />
              ) : sortOrder === "desc" ? (
                <IconChevronDown size="0.8rem" />
              ) : null
            }
          >
            Sort by Date
          </Button>
          <Text size="sm" c="dimmed">
            {posts.length} posts total
          </Text>
        </Group>
      </Group>

      <ScrollArea h="calc(100vh - 286px)" w="100%">
        {loading ? (
          <Box ta="center" py="xl">
            <Text c="dimmed">Loading posts...</Text>
          </Box>
        ) : posts.length === 0 ? (
          <Box ta="center" py="xl">
            <Text c="dimmed">No Drafts Created, create your first draft.</Text>
          </Box>
        ) : (
          <SimpleGrid cols={{ sm: 1, md: 2 }}>
            {sortedPosts.map((post) => (
              <Card
                key={post.id}
                shadow="xs"
                padding="md"
                radius="sm"
                component={Grid}
                withBorder
              >
                <Grid.Col
                  span={{ sm: 12, md: 4 }}
                  style={{ position: "relative" }}
                >
                  <Box
                    style={{
                      maxHeight: 240,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Image
                      src={post.files[0]}
                      alt={post.fileName?.[0] || "Post image"}
                      style={{ borderRadius: 8, objectFit: "cover" }}
                    />
                  </Box>
                  {post.files.length > 1 && (
                    <Badge
                      variant="filled"
                      size="lg"
                      style={{
                        position: "absolute",
                        top: 15,
                        right: 15,
                        padding: "2px 8px",
                      }}
                    >
                      +{post.files.length - 1}
                    </Badge>
                  )}
                </Grid.Col>
                <Grid.Col span={{ sm: 12, md: 8 }}>
                  {/* Header with status and actions */}
                  <Group justify="space-between" align="flex-start">
                    <StatusBadge post={post} />
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
                  </Group>
                  {/* Caption */}
                  <Box>
                    <Text size="sm" fw={500} mb={4}>
                      Caption:
                    </Text>
                    <Text size="sm" lineClamp={3}>
                      {post.caption}
                    </Text>
                  </Box>
                  {/* Notes */}
                  <Box mt="xs">
                    <Text size="sm" fw={500} mb={4} c="dimmed">
                      Notes:
                    </Text>
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      {post.notes || "-"}
                    </Text>
                  </Box>
                  {/* Metadata row */}
                  <Group gap="md" wrap="wrap" mt="xs">
                    {/* Hashtags */}
                    <Tooltip
                      label={
                        post.hashtags.length > 0
                          ? post.hashtags.map((tag) => `#${tag}`).join(" ")
                          : "No hashtags"
                      }
                      multiline
                      maw={300}
                    >
                      <Group gap="xs" style={{ cursor: "pointer" }}>
                        <IconHash size="1rem" />
                        <Text size="sm">{post.hashtags.length}</Text>
                      </Group>
                    </Tooltip>
                    {/* Collaborators */}
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
                      <Group gap="xs" style={{ cursor: "pointer" }}>
                        <IconAt size="1rem" />
                        <Text size="sm">{post.peopleToTag?.length || 0}</Text>
                      </Group>
                    </Tooltip>
                  </Group>
                </Grid.Col>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </ScrollArea>
    </Stack>
  );
};

export default PostsTable;
