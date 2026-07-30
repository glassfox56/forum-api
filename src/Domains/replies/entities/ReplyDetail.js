class ReplyDetail {
  constructor({ id, username, date, content, is_delete: isDelete }) {
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDelete ? '**balasan telah dihapus**' : content;
  }
}

export default ReplyDetail;
