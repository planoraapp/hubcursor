import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, MessageSquare, FileText, Activity } from 'lucide-react';

const AdminPanelPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
      fetchPosts();
      fetchComments();
      fetchLogs();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('habbo_accounts')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data);
    }
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*');

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*');

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data);
    }
  };

  const fetchLogs = async () => {
    // Implement your log fetching logic here
    setLogs([]);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.habbo_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    const { error } = await supabase
      .from('habbo_accounts')
      .update({ role: newRole })
      .eq('id', selectedUser.id);

    if (error) {
      console.error('Error updating role:', error);
    } else {
      fetchUsers();
      setSelectedUser({ ...selectedUser, role: newRole });
    }
  };

  const handleDeletePost = async (postId) => {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
    } else {
      fetchPosts();
    }
  };

  const handleDeleteComment = async (commentId) => {
    const { error } = await supabase
      .from('forum_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
    } else {
      fetchComments();
    }
  };

  if (!isAdmin()) {
    return <div className="text-center mt-10">Você não tem permissão para acessar esta página.</div>;
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection="admin" setActiveSection={() => {}} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="container mx-auto">
            <Card className="border-2 border-black">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold volter-font">Painel Administrativo</CardTitle>
                <Badge variant="secondary">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Badge>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="users" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="users" onClick={() => setActiveTab('users')}>
                      <Users className="mr-2 h-4 w-4" />
                      Usuários
                    </TabsTrigger>
                    <TabsTrigger value="posts" onClick={() => setActiveTab('posts')}>
                      <FileText className="mr-2 h-4 w-4" />
                      Posts
                    </TabsTrigger>
                    <TabsTrigger value="comments" onClick={() => setActiveTab('comments')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Comentários
                    </TabsTrigger>
                    <TabsTrigger value="logs" onClick={() => setActiveTab('logs')}>
                      <Activity className="mr-2 h-4 w-4" />
                      Logs
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="users">
                    <div className="mb-4">
                      <Input
                        type="text"
                        placeholder="Buscar usuário..."
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Lista de Usuários</h3>
                        <div className="max-h-80 overflow-y-auto">
                          {filteredUsers.map(user => (
                            <div
                              key={user.id}
                              className={`p-2 rounded-md cursor-pointer ${selectedUser?.id === user.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                              onClick={() => handleUserSelect(user)}
                            >
                              {user.habbo_name}
                            </div>
                          ))}
                        </div>
                      </div>
                      {selectedUser && (
                        <div>
                          <h3 className="text-xl font-semibold mb-2">Editar Usuário</h3>
                          <div className="mb-2">
                            <p>Nome: {selectedUser.habbo_name}</p>
                            <p>Email: {selectedUser.email}</p>
                            <p>ID: {selectedUser.id}</p>
                          </div>
                          <div className="mb-2">
                            <Input
                              type="text"
                              placeholder="Novo Role"
                              value={newRole}
                              onChange={(e) => setNewRole(e.target.value)}
                            />
                            <Button onClick={handleRoleChange} className="mt-2">
                              Alterar Role
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="posts">
                    <h3 className="text-xl font-semibold mb-2">Lista de Posts</h3>
                    <div className="max-h-80 overflow-y-auto">
                      {posts.map(post => (
                        <div key={post.id} className="p-2 rounded-md hover:bg-gray-50 flex justify-between items-center">
                          <span>{post.title} - {post.author_habbo_name}</span>
                          <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id)}>
                            Deletar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="comments">
                    <h3 className="text-xl font-semibold mb-2">Lista de Comentários</h3>
                    <div className="max-h-80 overflow-y-auto">
                      {comments.map(comment => (
                        <div key={comment.id} className="p-2 rounded-md hover:bg-gray-50 flex justify-between items-center">
                          <span>{comment.content} - {comment.author_habbo_name}</span>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteComment(comment.id)}>
                            Deletar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="logs">
                    <h3 className="text-xl font-semibold mb-2">Logs</h3>
                    <div>Em breve</div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanelPage;
