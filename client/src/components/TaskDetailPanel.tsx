import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useToast } from "@/hooks/use-toast";

interface TaskDetailPanelProps {
  taskId: string;
  onClose: () => void;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assigneeId?: string;
  attachments?: string[];
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export default function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch task details
  const { data: task } = useQuery<Task>({
    queryKey: ["/api/tasks", taskId],
  });

  // Fetch comments
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/tasks", taskId, "comments"],
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updates: Partial<Task>) => {
      const response = await apiRequest("PUT", `/api/tasks/${taskId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", taskId] });
      toast({
        title: "Success",
        description: "Task updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/comments`, {
        content
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", taskId, "comments"] });
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  });

  const handleFieldUpdate = (field: keyof Task, value: any) => {
    updateTaskMutation.mutate({ [field]: value });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: any) => {
    if (result.successful?.[0]?.uploadURL) {
      const newAttachments = [...(task?.attachments || []), result.successful[0].uploadURL];
      handleFieldUpdate("attachments", newAttachments);
      toast({
        title: "Success",
        description: "File uploaded successfully"
      });
    }
  };

  if (!task) {
    return (
      <aside className="w-96 bg-card border-l border-border flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-2xl text-muted-foreground mb-2"></i>
          <p className="text-muted-foreground">Loading task details...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-96 bg-card border-l border-border flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Task Details</h3>
        <button 
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-close-task-panel"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Task Header */}
        <div>
          <Input
            value={task.title}
            onChange={(e) => handleFieldUpdate("title", e.target.value)}
            className="text-xl font-semibold mb-2"
            data-testid="input-task-title"
          />
          <Textarea
            value={task.description || ""}
            onChange={(e) => handleFieldUpdate("description", e.target.value)}
            placeholder="Task description..."
            className="text-muted-foreground"
            data-testid="textarea-task-description"
          />
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <Select
              value={task.status}
              onValueChange={(value) => handleFieldUpdate("status", value)}
            >
              <SelectTrigger data-testid="select-task-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
            <Select
              value={task.priority}
              onValueChange={(value) => handleFieldUpdate("priority", value)}
            >
              <SelectTrigger data-testid="select-task-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Due Date</label>
          <Input
            type="date"
            value={task.dueDate ? task.dueDate.split('T')[0] : ""}
            onChange={(e) => handleFieldUpdate("dueDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
            data-testid="input-task-due-date"
          />
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Attachments</label>
          <div className="space-y-2">
            {task.attachments?.map((attachment, index) => (
              <div key={index} className="flex items-center justify-between bg-muted rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-file text-primary"></i>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {attachment.split('/').pop()?.split('?')[0] || 'Attachment'}
                    </p>
                    <p className="text-muted-foreground text-xs">File</p>
                  </div>
                </div>
                <button 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => window.open(attachment, '_blank')}
                  data-testid={`button-download-attachment-${index}`}
                >
                  <i className="fas fa-download"></i>
                </button>
              </div>
            )) || []}

            {/* Upload Button */}
            <ObjectUploader
              maxNumberOfFiles={5}
              maxFileSize={10485760}
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="w-full"
            >
              <div className="w-full bg-muted border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors group">
                <i className="fas fa-cloud-upload-alt text-muted-foreground group-hover:text-primary text-xl mb-2"></i>
                <p className="text-muted-foreground group-hover:text-primary text-sm">
                  Drop files or click to upload
                </p>
              </div>
            </ObjectUploader>
          </div>
        </div>

        {/* AI Actions */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">AI Actions</label>
          <div className="space-y-2">
            <Button 
              className="w-full"
              variant="default"
              data-testid="button-generate-subtasks"
            >
              <i className="fas fa-magic mr-2"></i>Generate Subtasks
            </Button>
            <Button 
              className="w-full"
              variant="secondary"
              data-testid="button-schedule-reminder"
            >
              <i className="fas fa-calendar-plus mr-2"></i>Schedule Reminder
            </Button>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="button-send-email"
            >
              <i className="fas fa-envelope mr-2"></i>Send Email Update
            </Button>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Comments</label>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground text-sm font-medium">U</span>
                </div>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-foreground text-sm">{comment.content}</p>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Add Comment */}
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-foreground text-sm font-medium">U</span>
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="resize-none"
                  rows={3}
                  data-testid="textarea-new-comment"
                />
                <div className="mt-2 flex justify-end">
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    data-testid="button-post-comment"
                  >
                    {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
