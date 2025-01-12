import PageLayout from '../components/PageLayout';

function Settings() {
  return (
    <PageLayout 
      title="Settings"
      showFab={false}
    >
      <div className="section-container">
        <h2 className="section-title">Account Settings</h2>
      </div>

      <div className="data-container">
        {/* Settings options */}
      </div>
    </PageLayout>
  );
}

export default Settings; 