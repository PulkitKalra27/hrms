import Sidebar from "./Sidebar"
import Header from "./Header"

const Layout = ({ children, title }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header title={title} />
        <main className="content">{children}</main>
      </div>
    </div>
  )
}

export default Layout
