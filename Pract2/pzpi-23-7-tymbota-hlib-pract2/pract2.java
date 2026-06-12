import java.util.LinkedList;
import java.util.Queue;

class VideoTask {
    private final String fileName;
    private final String userName;

    public VideoTask(String fileName, String userName) {
        this.fileName = fileName;
        this.userName = userName;
    }

    public String getFileName() {
        return fileName;
    }

    public String getUserName() {
        return userName;
    }
}

class ProcessingQueue {
    private final Queue<VideoTask> tasks = new LinkedList<>();

    public void addTask(VideoTask task) {
        tasks.add(task);
        System.out.println("Задачу додано до черги: " + task.getFileName());
    }

    public VideoTask getNextTask() {
        return tasks.poll();
    }

    public boolean hasTasks() {
        return !tasks.isEmpty();
    }
}

class VideoUploadService {
    private final ProcessingQueue queue;

    public VideoUploadService(ProcessingQueue queue) {
        this.queue = queue;
    }

    public void uploadVideo(String fileName, String userName) {
        System.out.println("Користувач " + userName + " завантажив відео: " + fileName);
        VideoTask task = new VideoTask(fileName, userName);
        queue.addTask(task);
    }
}

class TranscodingService {
    public String transcode(VideoTask task) {
        System.out.println("Транскодування відео: " + task.getFileName());
        return "processed_" + task.getFileName();
    }
}

class StorageService {
    public void save(String processedFileName) {
        System.out.println("Оброблене відео збережено: " + processedFileName);
    }
}

class NotificationService {
    public void notifyUser(String userName, String fileName) {
        System.out.println("Користувача " + userName + " повідомлено про готовність відео: " + fileName);
    }
}

class VideoProcessingWorker {
    private final ProcessingQueue queue;
    private final TranscodingService transcodingService;
    private final StorageService storageService;
    private final NotificationService notificationService;

    public VideoProcessingWorker(
            ProcessingQueue queue,
            TranscodingService transcodingService,
            StorageService storageService,
            NotificationService notificationService) {
        this.queue = queue;
        this.transcodingService = transcodingService;
        this.storageService = storageService;
        this.notificationService = notificationService;
    }

    public void processTasks() {
        while (queue.hasTasks()) {
            VideoTask task = queue.getNextTask();
            String processedFileName = transcodingService.transcode(task);
            storageService.save(processedFileName);
            notificationService.notifyUser(task.getUserName(), processedFileName);
        }
    }
}

class VideoProcessingDemo {
    public static void main(String[] args) {
        ProcessingQueue queue = new ProcessingQueue();

        VideoUploadService uploadService = new VideoUploadService(queue);
        TranscodingService transcodingService = new TranscodingService();
        StorageService storageService = new StorageService();
        NotificationService notificationService = new NotificationService();

        VideoProcessingWorker worker = new VideoProcessingWorker(
                queue,
                transcodingService,
                storageService,
                notificationService
        );

        uploadService.uploadVideo("architecture-youtube.mp4", "Hlib");
        uploadService.uploadVideo("software-systems.mp4", "Student");

        worker.processTasks();
    }
}і