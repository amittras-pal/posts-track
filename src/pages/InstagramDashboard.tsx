import {
  ActionIcon,
  Drawer,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPhotoPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { CreatePostForm, PostDetailsView, PostsTable } from "../components";
import { firestoreService } from "../services";
import { InstagramPost } from "../types";
import { copyCaptionAndHashtagsSeparately } from "../utils/clipboardUtils";

const InstagramDashboard = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    setLoading(true);

    // Subscribe to real-time updates
    const unsubscribe = firestoreService.subscribeToUnpostedPosts(
      (unpostedPosts) => {
        setPosts(unpostedPosts);
        setLoading(false);
      }
    );

    // Cleanup subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const handleCopyPost = async (post: InstagramPost) => {
    try {
      await copyCaptionAndHashtagsSeparately(post);

      const hasCaption = !!post.caption;
      const hasHashtags = post.hashtags.length > 0;

      let message = "Post content copied to clipboard";
      if (hasCaption && hasHashtags) {
        message = "Caption and hashtags copied separately to clipboard";
      } else if (hasCaption) {
        message = "Caption copied to clipboard";
      } else if (hasHashtags) {
        message = "Hashtags copied to clipboard";
      }

      notifications.show({
        title: "Copied!",
        message,
        color: "green",
      });
    } catch (error) {
      console.error("Failed to copy post:", error);
      notifications.show({
        title: "Copy Failed",
        message:
          error instanceof Error
            ? error.message
            : "Failed to copy post content to clipboard",
        color: "red",
      });
    }
  };

  const handleViewDetails = (post: InstagramPost) => {
    setSelectedPost(post);
    setShowDetailsDrawer(true);
  };

  const handleEditPost = (post: InstagramPost) => {
    setEditingPost(post);
    setShowCreateForm(true);
  };

  const handleMarkAsPosted = async (post: InstagramPost) => {
    if (!post.id) return;

    try {
      await firestoreService.updatePost(post.id, {
        isPosted: true,
        postedAt: new Date(),
      });

      notifications.show({
        title: "Success!",
        message: "Post marked as posted successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Failed to mark post as posted:", error);
      notifications.show({
        title: "Error",
        message: "Failed to mark post as posted. Please try again.",
        color: "red",
      });
    }
  };

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={1} c="violet">
            Instagram Posts
          </Title>
          <Tooltip label="Create New Post">
            <ActionIcon
              variant="light"
              color="green"
              size="xl"
              radius="xl"
              onClick={() => setShowCreateForm(true)}
            >
              <IconPhotoPlus size="1.2rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Text size="lg" c="dimmed">
          Manage consistency for your instagram posts.
        </Text>

        {/* Main Content */}
        <PostsTable
          posts={posts}
          loading={loading}
          onViewDetails={handleViewDetails}
          onCopyPost={handleCopyPost}
          onEditPost={handleEditPost}
          onMarkAsPosted={handleMarkAsPosted}
        />
      </Stack>

      {/* Create New Post Modal */}
      <Drawer
        opened={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setEditingPost(null);
        }}
        position="right"
        title={editingPost ? "Edit Post" : "Create New Post"}
        styles={{
          title: { fontSize: 24, fontWeight: 700 },
          inner: { right: 0 },
        }}
      >
        <CreatePostForm
          onClose={() => {
            setShowCreateForm(false);
            setEditingPost(null);
          }}
          schedules={posts
            .map((p) => p.scheduledFor)
            .filter((p) => p !== null && p !== undefined)}
          editingPost={editingPost}
        />
      </Drawer>

      {/* View Details Drawer */}
      <Drawer
        opened={showDetailsDrawer}
        onClose={() => {
          setShowDetailsDrawer(false);
          setSelectedPost(null);
        }}
        position="right"
        title="Post Details"
        size="lg"
        styles={{
          title: { fontSize: 24, fontWeight: 700 },
          inner: { right: 0 },
        }}
      >
        {selectedPost && <PostDetailsView post={selectedPost} />}
      </Drawer>
    </>
  );
};

export default InstagramDashboard;
