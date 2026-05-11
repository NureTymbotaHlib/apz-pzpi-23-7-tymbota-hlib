/*
Запит до ШІ:
Поясни шаблон проєктування Proxy та створи простий приклад реалізації мовою Java.

Запит до ШІ:
Створи приклад Proxy для відкладеного завантаження документа з перевіркою доступу користувача.
*/

interface Document {
    void display();
}

class RealDocument implements Document {
    private final String fileName;

    public RealDocument(String fileName) {
        this.fileName = fileName;
        loadFromDisk();
    }

    private void loadFromDisk() {
        System.out.println("Завантаження документа з диска: " + fileName);
    }

    @Override
    public void display() {
        System.out.println("Відображення документа: " + fileName);
    }
}

class ProxyDocument implements Document {
    private final String fileName;
    private final String userRole;
    private RealDocument realDocument;

    public ProxyDocument(String fileName, String userRole) {
        this.fileName = fileName;
        this.userRole = userRole;
    }

    @Override
    public void display() {
        if (!hasAccess()) {
            System.out.println("Доступ заборонено для ролі: " + userRole);
            return;
        }

        if (realDocument == null) {
            realDocument = new RealDocument(fileName);
        }

        realDocument.display();
    }

    private boolean hasAccess() {
        return userRole.equals("ADMIN") || userRole.equals("TEACHER");
    }
}

class Main {
    public static void main(String[] args) {
        Document studentDocument = new ProxyDocument("architecture-report.pdf", "STUDENT");
        studentDocument.display();

        System.out.println();

        Document teacherDocument = new ProxyDocument("architecture-report.pdf", "TEACHER");
        teacherDocument.display();
        teacherDocument.display();
    }
}
