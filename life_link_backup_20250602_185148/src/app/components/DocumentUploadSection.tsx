import { fetchUserRole } from '@/lib/documentService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const [role, setRole] = useState('user');

useEffect(() => {
  async function getRole() {
    if (user?.id) {
      const userRole = await fetchUserRole(user.id);
      setRole(userRole);
    }
  }
  getRole();
}, [user]);

{role === 'admin' && (
  <button onClick={() => handleDelete(doc.id, doc.file_url, role)}>
    Delete
  </button>
)}

const handleDelete = async (userId, fileUrl, userRole) => {
  try {
    await deleteUserDocument(userId, fileUrl, userRole);
    // ...refresh or update state as needed...
  } catch (err) {
    toast.error(err.message);
  }
}; 