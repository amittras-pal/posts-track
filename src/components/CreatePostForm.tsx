import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Image,
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
  IconClipboard,
  IconHash,
  IconPhoto,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  addPost,
  deleteFilesFromStorage,
  updatePost,
  uploadImages,
} from "../services";
import { CreateInstagramPost, InstagramPost } from "../types";

interface CreatePostFormProps {
  onClose: () => void;
  editingPost?: InstagramPost | null;
  schedules: Date[];
}

type ImageItem =
  | { type: "url"; url: string; name: string }
  | { type: "file"; file: File; name: string };

const CreatePostForm = ({
  onClose,
  editingPost,
  schedules,
}: CreatePostFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state from editingPost when it changes
  useEffect(() => {
    if (editingPost) {
      // Map file URLs and names to ImageItem objects
      const urlItems: ImageItem[] = (editingPost.files || []).map((url, i) => ({
        type: "url",
        url,
        name: editingPost.fileName?.[i] || `image_${i + 1}`,
      }));
      setImages(urlItems);
    } else {
      setImages([]);
    }
  }, [editingPost]);

  const defaultValues: CreateInstagramPost = {
    fileName: editingPost?.fileName || [],
    files: editingPost?.files || [],
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
    setValue,
    formState: { errors },
  } = useForm<CreateInstagramPost>({
    defaultValues,
  });

  // Keep fileName in sync with images
  useEffect(() => {
    setValue(
      "fileName",
      images.map((img) => img.name)
    );
  }, [images, setValue]);

  // Handle paste
  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          setImages((prev) => [
            ...prev,
            { type: "file", file, name: file.name },
          ]);
          notifications.show({
            title: "Image Pasted!",
            message: "Image has been added from clipboard",
            color: "green",
          });
        }
      }
    }
  }, []);

  const handlePasteClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          setImages((prev) => [
            ...prev,
            { type: "file", file, name: file.name },
          ]);
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Add paste event listener
  useEffect(() => {
    const handlePasteEvent = (e: ClipboardEvent) => handlePaste(e);
    document.addEventListener("paste", handlePasteEvent);
    return () => document.removeEventListener("paste", handlePasteEvent);
  }, [handlePaste]);

  // Type guards
  function isUrlImage(
    img: ImageItem
  ): img is { type: "url"; url: string; name: string } {
    return img.type === "url";
  }
  function isFileImage(
    img: ImageItem
  ): img is { type: "file"; file: File; name: string } {
    return img.type === "file";
  }

  const onSubmit = async (data: CreateInstagramPost) => {
    setIsSubmitting(true);
    try {
      // Split images into URLs and Files using type guards
      const urlItems = images.filter(isUrlImage);
      const fileItems = images.filter(isFileImage);
      let uploadedFileUrls: string[] = [];
      let filesToDelete: string[] = [];

      // Upload new images to Firebase Storage if there are any
      if (fileItems.length > 0) {
        try {
          uploadedFileUrls = await uploadImages(
            fileItems.map((img) => img.file)
          );
        } catch (uploadError) {
          notifications.show({
            title: "Upload Error",
            message: "Failed to upload images. Please try again.",
            color: "red",
          });
          return;
        }
      }

      // Prepare the data with all file URLs
      const allFiles = [...urlItems.map((img) => img.url), ...uploadedFileUrls];
      const allFileNames = images.map((img) => img.name);
      const postData = {
        ...data,
        files: allFiles,
        fileName: allFileNames,
      };

      if (editingPost && editingPost.id) {
        // Find files to delete (present in editingPost.files but not in allFiles)
        const originalFiles = editingPost.files || [];
        filesToDelete = originalFiles.filter((url) => !allFiles.includes(url));
        await updatePost(editingPost.id, postData);
        if (filesToDelete.length > 0) {
          await deleteFilesFromStorage(filesToDelete);
        }
        notifications.show({
          title: "Success!",
          message: "Instagram post updated successfully",
          color: "green",
        });
      } else {
        await addPost(postData);
        notifications.show({
          title: "Success!",
          message: "Instagram post created successfully",
          color: "green",
        });
      }
      reset();
      setImages([]);
      onClose();
    } catch (error) {
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

      {/* Clipboard Images */}
      <Box>
        <Text size="sm" fw={500} mb={8}>
          Images
        </Text>
        <Text size="xs" c="dimmed" mb={12}>
          Paste images from clipboard (Ctrl+V) or click to select files
        </Text>
        <Group gap="xs" mb="md">
          <Button
            variant="light"
            size="sm"
            leftSection={<IconClipboard size="1rem" />}
            onClick={handlePasteClick}
          >
            {editingPost ? "Add Images" : "Select Images"}
          </Button>
          <Text size="xs" c="dimmed">
            {images.length} image(s) selected
          </Text>
        </Group>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        {images.length > 0 && (
          <Grid gutter="xs">
            {images.map((img, index) => (
              <Grid.Col key={index} span={4}>
                <Box pos="relative">
                  <Image
                    src={
                      img.type === "url"
                        ? img.url
                        : URL.createObjectURL(img.file)
                    }
                    alt={img.name}
                    radius="sm"
                    style={{ maxHeight: 120, objectFit: "cover" }}
                  />
                  <ActionIcon
                    variant="filled"
                    color="red"
                    size="xs"
                    style={{ position: "absolute", top: 4, right: 4 }}
                    onClick={() => removeImage(index)}
                  >
                    <IconX size="0.8rem" />
                  </ActionIcon>
                </Box>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Box>
      {/* File Names */}
      <Controller
        name="fileName"
        control={control}
        rules={{ required: "At least one file name is required" }}
        render={({ field }) => (
          <TagsInput
            label="File Names"
            description="File names from selected images (read-only)"
            placeholder="Add images to populate file names"
            value={images.map((img) => img.name)}
            onChange={field.onChange}
            leftSection={<IconPhoto size="1rem" />}
            error={errors.fileName?.message}
            readOnly
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
