class CommentDetail {
  constructor({ id, username, date, content, is_delete: isDelete }) {
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
  }
}

export default CommentDetail;
