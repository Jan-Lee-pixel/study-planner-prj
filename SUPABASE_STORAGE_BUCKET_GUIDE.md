# Supabase Storage Bucket Setup (for attachments)

Use this guide when you want users to upload screenshots, PDFs, or any other attachments that live alongside their tasks. The goal is to create a dedicated bucket in Supabase Storage, secure it with Row-Level Security (RLS) policies, and expose the public endpoint to your front end.

---

## 1. Prerequisites

| Requirement | Notes |
|-------------|-------|
| Supabase project | Either the existing project backing Study Planner or a new one. |
| Supabase CLI (optional) | Helpful for automation, but you can use the web dashboard for everything in this guide. |
| `.env` entries | Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are already in place. You will add a storage bucket name soon. |

---

## 2. Create a Bucket

1. **Open Supabase Dashboard** → select your project.
2. Navigate to **Storage** → **Create bucket**.
3. Recommended settings:
   - **Name**: `task-attachments` (lowercase, hyphenated).
   - **Public bucket**: _unchecked_. We will control access via policies.
   - Confirm and create.

> The bucket name is case-sensitive. Note it for later use in your front-end env config.

---

## 3. Define Policies

### Basic idea
We want authenticated users to read and write files they own. Ownership can be tracked by storing the `user_id` inside the file path: `task-attachments/{user_id}/{task_id}/{filename}`.

### Create policies
1. On the Storage → `task-attachments` bucket → **Policies**.
2. Add a policy called **"Allow uploads by owner"** with the SQL:
   ```sql
   (bucket_id = 'task-attachments')
     AND (auth.uid() = (storage.foldername(storage.object_ref))[1])
   ```
   - This checks that the first folder in the path matches the authed user ID.
   - Apply to `INSERT`.
3. Add **"Allow downloads by owner"** with similar logic, applied to `SELECT`.
4. If teammates should read attachments, create a policy that checks membership in a `team_members` table or `auth.role()` as needed.

> Supabase’s UI can build these policies; switch to “SQL editor” mode to paste the expressions.

---

## 4. Surface Bucket Info to the Front-End

Add these to your `front-end/.env`:
```env
VITE_SUPABASE_STORAGE_BUCKET=task-attachments
VITE_SUPABASE_STORAGE_BASE_URL=https://<your-project-ref>.supabase.co/storage/v1/object/public
```

If the bucket is private (recommended), you won’t use the public `object` endpoint. Instead, you will generate signed URLs via Supabase JS:

```js
const bucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET;

// Upload
await supabase.storage
  .from(bucket)
  .upload(`${user.id}/${taskId}/${file.name}`, file, { upsert: true });

// Signed download URL (expires in 1 hour)
const { data } = await supabase.storage
  .from(bucket)
  .createSignedUrl(`${user.id}/${taskId}/${file.name}`, 60 * 60);
```

---

## 5. Optional: Cli Workflow

If you prefer CLI automation:
```bash
supabase login
supabase init
supabase storage create task-attachments
```
Then commit the generated `supabase/config.toml` and RLS policies for reproducibility.

---

## 6. Next Steps in the App

1. **DB schema**: Add a `task_attachments` table (id, task_id, user_id, file_name, mime_type, storage_path).
2. **UI**: Add an upload section in `TaskDetail` (drag/drop or `input type="file"`).
3. **Cleanup**: On task delete, call `supabase.storage.from(bucket).remove([...paths])`.

Following this checklist, you can confidently store user files in Supabase without exposing them publicly. Let me know when you’re ready to wire the upload UI and I’ll help scaffold it. 
