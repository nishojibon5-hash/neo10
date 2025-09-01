export const requests: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const { rows } = await query(
      `select u.id, u.name, u.avatar_url, f.created_at
         from friendships f join users u on u.id=f.user_id
        where f.friend_id=$1 and f.status='pending' order by f.created_at desc`,
      [sub]
    );
    res.json({ requests: rows });
  } catch { res.status(500).json({ error: "Failed" }); }
};

export const suggestions: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const { rows } = await query(
      `select u.id, u.name, u.avatar_url from users u
        where u.id<>$1 and u.id not in (
          select friend_id from friendships where user_id=$1
          union all
          select user_id from friendships where friend_id=$1
        )
        order by random() limit 20`,
      [sub]
    );
    res.json({ users: rows });
  } catch { res.status(500).json({ error: "Failed" }); }
};

export const friendsList: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const { rows } = await query(
      `select u.id, u.name, u.avatar_url from friendships f
        join users u on u.id = case when f.user_id=$1 then f.friend_id else f.user_id end
       where (f.user_id=$1 or f.friend_id=$1) and f.status='friends'`,
      [sub]
    );
    res.json({ friends: rows });
  } catch { res.status(500).json({ error: "Failed" }); }
};

export const unfriend: RequestHandler = async (req, res) => {
  try {
    const sub = authSub(req);
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    const other = req.params.id;
    await query(`delete from friendships where (user_id=$1 and friend_id=$2) or (user_id=$2 and friend_id=$1)`, [sub, other]);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Failed" }); }
};
