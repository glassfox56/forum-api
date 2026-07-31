/* eslint-disable camelcase */
export const up = (pgm) => {
  pgm.createTable('comment_likes', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"',
      onDelete: 'CASCADE',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
  });
  pgm.addConstraint(
    'comment_likes',
    'unique_comment_like',
    'UNIQUE(comment_id, owner)',
  );
};

export const down = (pgm) => {
  pgm.dropTable('comment_likes');
};
