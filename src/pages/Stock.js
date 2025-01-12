import PageLayout from '../components/PageLayout';

function Stock() {
  return (
    <PageLayout 
      title="Stock Management"
      showFab={true}
      onFabClick={() => {/* Handle fab click */}}
    >
      <div className="stats-widgets">
        {/* Stock statistics widgets */}
      </div>

      <div className="section-container">
        <h2 className="section-title">Stock Overview</h2>
      </div>

      <div className="data-container">
        {/* Stock items list */}
      </div>
    </PageLayout>
  );
}

export default Stock; 