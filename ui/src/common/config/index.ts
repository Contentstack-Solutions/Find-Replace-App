const refIgnoreText = "._content_type_uid"

const fieldsToBeIgnoreWhileUpdatingEntry = [
  "locale",
  "created_by",
  "updated_by",
  "created_at",
  "updated_at",
  "ACL",
  "_version",
  "_in_progress",
  "_metadata",
  "_version",
  "tags",
  "file_size",
  "is_dir",
  "parent_uid",
  "filename",
  "uid",
];

// eslint-disable-next-line
export {
  fieldsToBeIgnoreWhileUpdatingEntry,
  refIgnoreText
};
