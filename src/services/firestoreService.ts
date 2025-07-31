import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { CreateInstagramPost, InstagramPost } from "../types";

const COLLECTION_NAME = "InstaPosts";

// Upload image files to Firebase Storage
export async function uploadImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(async (file, index) => {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${index}_${file.name}`;
    const storageRef = ref(storage, `images/${fileName}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw new Error(`Failed to upload ${file.name}`);
    }
  });

  return Promise.all(uploadPromises);
}

// Add a new Instagram post
export async function addPost(postData: CreateInstagramPost): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...postData,
      files: postData.files || [],
      createdAt: new Date(),
      postedAt: postData.isPosted ? new Date() : null,
      scheduledFor: postData.scheduledFor
        ? Timestamp.fromDate(postData.scheduledFor)
        : null,
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
}

/**
 * Get all posts from Firestore
 * TODO: DEAD CODE - This method is not used anywhere in the codebase
 */
export async function getAllPosts(): Promise<InstagramPost[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const posts: InstagramPost[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        files: data.files || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        postedAt: data.postedAt?.toDate() || null,
        scheduledFor: data.scheduledFor?.toDate() || null,
      } as InstagramPost);
    });

    return posts;
  } catch (error) {
    console.error("Error getting documents: ", error);
    throw error;
  }
}

// Subscribe to real-time updates for unposted Instagram posts
export function subscribeToUnpostedPosts(
  callback: (posts: InstagramPost[]) => void
): () => void {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("isPosted", "==", false),
    orderBy("createdAt", "asc")
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const posts: InstagramPost[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          files: data.files || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          postedAt: data.postedAt?.toDate() || null,
          scheduledFor: data.scheduledFor?.toDate() || null,
        } as InstagramPost);
      });

      callback(posts);
    },
    (error) => {
      console.error("Error in real-time subscription: ", error);
    }
  );

  return unsubscribe;
}

// Update an existing post
export async function updatePost(
  id: string,
  updateData: Partial<CreateInstagramPost> & { postedAt?: Date | null }
): Promise<void> {
  console.log({
    ...updateData,
    updatedAt: Timestamp.fromDate(new Date()),
    scheduledFor: updateData.scheduledFor
      ? Timestamp.fromDate(updateData.scheduledFor)
      : null,
    postedAt: updateData.postedAt
      ? Timestamp.fromDate(updateData.postedAt)
      : null,
  });
  // return;

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Timestamp.fromDate(new Date()),
      scheduledFor: updateData.scheduledFor
        ? Timestamp.fromDate(updateData.scheduledFor)
        : null,
      postedAt: updateData.postedAt
        ? Timestamp.fromDate(updateData.postedAt)
        : null,
    });
    console.log("Document updated successfully");
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
}

// Delete files from Firebase Storage by their URLs
export async function deleteFilesFromStorage(urls: string[]): Promise<void> {
  const deletePromises = urls.map(async (url) => {
    try {
      // Get the storage reference from the URL
      const storagePath = url.split("/o/")[1]?.split("?")[0];
      if (!storagePath) return;
      const decodedPath = decodeURIComponent(storagePath);
      const fileRef = ref(storage, decodedPath);
      await deleteObject(fileRef);
    } catch (error) {
      console.error(`Error deleting file at ${url}:`, error);
    }
  });
  await Promise.all(deletePromises);
}
