class CommentDetail {
  constructor({
    id,
    username,
    date,
    content,
    is_delete: isDelete,
    like_count: likeCount = 0,
  }) {
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
    this.likeCount = Number(likeCount) || 0;
  }
}

export default CommentDetail;
