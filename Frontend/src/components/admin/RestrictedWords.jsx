import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RestrictedWords = () => {
  const [words, setWords] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWord, setNewWord] = useState({
    word: '',
    category: 'custom',
    severity: 'medium'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/restricted-words', {
        withCredentials: true
      });
      setWords(response.data);
    } catch (error) {
      console.error('Error fetching restricted words:', error);
      toast.error('Failed to fetch restricted words');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/admin/restricted-words', newWord, {
        withCredentials: true
      });
      toast.success('Restricted word added successfully');
      setIsDialogOpen(false);
      setNewWord({ word: '', category: 'custom', severity: 'medium' });
      fetchWords();
    } catch (error) {
      console.error('Error adding restricted word:', error);
      toast.error('Failed to add restricted word');
    }
  };

  const handleDeleteWord = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/admin/restricted-words/${id}`, {
        withCredentials: true
      });
      toast.success('Restricted word deleted successfully');
      fetchWords();
    } catch (error) {
      console.error('Error deleting restricted word:', error);
      toast.error('Failed to delete restricted word');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Restricted Words</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Word</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Restricted Word</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddWord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Word</label>
                <Input
                  value={newWord.word}
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Select
                  value={newWord.category}
                  onValueChange={(value) => setNewWord({ ...newWord, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profanity">Profanity</SelectItem>
                    <SelectItem value="violence">Violence</SelectItem>
                    <SelectItem value="drugs">Drugs</SelectItem>
                    <SelectItem value="hate">Hate Speech</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Severity</label>
                <Select
                  value={newWord.severity}
                  onValueChange={(value) => setNewWord({ ...newWord, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Add Word</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Word</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Added By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {words.map((word) => (
              <TableRow key={word._id}>
                <TableCell>{word.word}</TableCell>
                <TableCell className="capitalize">{word.category}</TableCell>
                <TableCell className="capitalize">{word.severity}</TableCell>
                <TableCell>{word.addedBy?.name}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteWord(word._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RestrictedWords; 