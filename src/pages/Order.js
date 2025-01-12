import PageLayout from '../components/PageLayout';

function Order() {
  return (
    <PageLayout 
      title="Orders"
      showFab={false}
    >
      <div className="stats-widgets">
        {/* Order statistics widgets */}
      </div>

      <div className="section-container">
        <h2 className="section-title">Recent Orders</h2>
      </div>

      <div className="data-container">
        {/* Orders list */}
      </div>
    </PageLayout>
  );
}

export default Order; 