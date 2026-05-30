import { useEffect, useState } from "react"
import api from "./api"

function Dashboard() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    console.log("✅ Dashboard rendered");
    api.get("/posts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.log(err))
  }, [])

  return (
    <div>
      <h1>Dashboard</h1>

      {posts.length === 0 ? (
        <p>No posts yet</p>
      ) : (
        posts.map((post) => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default Dashboard