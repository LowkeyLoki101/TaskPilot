import { 
  users, projects, tasks, comments, chatMessages,
  type User, type InsertUser,
  type Project, type InsertProject,
  type Task, type InsertTask,
  type Comment, type InsertComment,
  type ChatMessage, type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByOwner(ownerId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;

  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  getTasksByProject(projectId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Comments
  getCommentsByTask(taskId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Chat Messages
  getChatMessagesByProject(projectId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByOwner(ownerId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.ownerId, ownerId));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  // Tasks
  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return (task as Task) || undefined;
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    const results = await db.select().from(tasks).where(eq(tasks.projectId, projectId));
    return results as Task[];
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task as Task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task as Task;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Comments
  async getCommentsByTask(taskId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.taskId, taskId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  // Chat Messages
  async getChatMessagesByProject(projectId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.projectId, projectId))
      .orderBy(desc(chatMessages.createdAt));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
