import GroupList from "@/features/groups/components/GroupList";
import Header from "@/components/root/Header";

const Home = () => {
  // console.log(groups);
  return (
    <section className="layout-container">
      <div className="layout-content">
        <Header />
        <GroupList />
      </div>
    </section>
  );
};

export default Home;
