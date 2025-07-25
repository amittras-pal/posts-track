import {
  Button,
  Divider,
  Group,
  Indicator,
  Stack,
  Switch,
  TagsInput,
  Text,
  Textarea,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  IconCalendar,
  IconHash,
  IconPhoto,
  IconUser,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { firestoreService } from "../services";
import { CreateInstagramPost, InstagramPost } from "../types";

interface CreatePostFormProps {
  onClose: () => void;
  editingPost?: InstagramPost | null;
  schedules: Date[];
}

const CreatePostForm = ({
  onClose,
  editingPost,
  schedules,
}: CreatePostFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: CreateInstagramPost = {
    fileName: editingPost?.fileName || [],
    caption: editingPost?.caption || "",
    hashtags: editingPost?.hashtags || [],
    peopleToTag: editingPost?.peopleToTag || [],
    notes: editingPost?.notes || "",
    isPosted: editingPost?.isPosted || false,
    scheduledFor: editingPost?.scheduledFor || null,
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateInstagramPost>({
    defaultValues,
  });

  const onSubmit = async (data: CreateInstagramPost) => {
    setIsSubmitting(true);

    try {
      if (editingPost && editingPost.id) {
        // Update existing post
        await firestoreService.updatePost(editingPost.id, data);

        // Show success notification
        notifications.show({
          title: "Success!",
          message: "Instagram post updated successfully",
          color: "green",
        });
      } else {
        // Create new post
        await firestoreService.addPost(data);
        // Show success notification
        notifications.show({
          title: "Success!",
          message: "Instagram post created successfully",
          color: "green",
        });
      }

      // Reset form and close modal
      reset();
      onClose();
    } catch (error) {
      console.error("Error saving post:", error);

      // Show error notification
      notifications.show({
        title: "Error",
        message: editingPost
          ? "Failed to update post. Please try again."
          : "Failed to create post. Please try again.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack
      gap="md"
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      className="form-content"
    >
      <Text size="sm" c="dimmed">
        Create a new Instagram post with all the details you need to track.
      </Text>

      <Divider />

      {/* File Names */}
      <Controller
        name="fileName"
        control={control}
        rules={{ required: "At least one file name is required" }}
        render={({ field }) => (
          <TagsInput
            autoFocus
            label="File Names"
            description="Add file names for your post (images/videos)"
            placeholder="Enter file name and press Enter"
            value={field.value}
            onChange={field.onChange}
            leftSection={<IconPhoto size="1rem" />}
            error={errors.fileName?.message}
          />
        )}
      />

      {/* Caption */}
      <Controller
        name="caption"
        control={control}
        rules={{ required: "Caption is required" }}
        render={({ field }) => (
          <Textarea
            label="Caption"
            description="Write your Instagram post caption"
            placeholder="What's happening..."
            value={field.value}
            onChange={field.onChange}
            minRows={3}
            maxRows={6}
            maxLength={2200}
            error={errors.caption?.message}
          />
        )}
      />

      {/* Hashtags */}
      <Controller
        name="hashtags"
        control={control}
        render={({ field }) => (
          <TagsInput
            label="Hashtags"
            description="Add hashtags (without # symbol)"
            placeholder="Enter hashtag and press Enter"
            value={field.value}
            onChange={field.onChange}
            leftSection={<IconHash size="1rem" />}
            maxTags={30}
          />
        )}
      />

      {/* People to Tag */}
      <Controller
        name="peopleToTag"
        control={control}
        render={({ field }) => (
          <TagsInput
            label="People to Tag"
            description="Add usernames to tag (without @ symbol)"
            placeholder="Enter username and press Enter"
            value={field.value}
            onChange={field.onChange}
            leftSection={<IconUser size="1rem" />}
            maxTags={20}
          />
        )}
      />

      {/* Notes */}
      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Notes"
            description="Additional notes about this post"
            placeholder="Add any notes or reminders..."
            value={field.value}
            onChange={field.onChange}
            minRows={2}
            maxRows={4}
            maxLength={500}
          />
        )}
      />

      {/* Scheduled For */}
      <Controller
        name="scheduledFor"
        control={control}
        render={({ field }) => (
          <DateTimePicker
            label="Schedule For"
            description="When should this post be published?"
            placeholder="Select date and time"
            value={field.value ? field.value.toISOString() : null}
            renderDay={(day) => {
              const sch =
                schedules.find((date) =>
                  dayjs(date).isSame(dayjs(day), "date")
                ) ?? null;
              return (
                <Indicator size={6} color="violet" offset={-5} disabled={!sch}>
                  <div>{dayjs(day).format("DD")}</div>
                </Indicator>
              );
            }}
            onChange={(value: string | null) => {
              const dateValue = value ? new Date(value) : null;
              field.onChange(dateValue);
            }}
            leftSection={<IconCalendar size="1rem" />}
            clearable
            minDate={new Date()}
          />
        )}
      />

      {/* Is Posted */}
      <Controller
        name="isPosted"
        control={control}
        render={({ field }) => (
          <Switch
            label="Mark as Posted"
            description="Check if this post has already been published"
            checked={field.value}
            onChange={(e) => field.onChange(e.currentTarget.checked)}
          />
        )}
      />

      <Divider />

      {/* Form Actions */}
      <Group justify="flex-end">
        <Button
          variant="outline"
          onClick={onClose}
          type="button"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="gradient"
          gradient={{ from: "purple", to: "pink" }}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? editingPost
              ? "Updating..."
              : "Creating..."
            : editingPost
              ? "Update Post"
              : "Create Post"}
        </Button>
      </Group>
    </Stack>
  );
};

export default CreatePostForm;
