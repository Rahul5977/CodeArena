import { FiBook } from 'react-icons/fi'

const SheetManagement = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sheet Management</h1>
      
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center py-20">
            <FiBook className="mx-auto text-6xl text-base-content/30 mb-4" />
            <h2 className="text-xl font-bold text-base-content/50 mb-2">
              Sheet Management
            </h2>
            <p className="text-base-content/40">
              Sheet management features coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SheetManagement