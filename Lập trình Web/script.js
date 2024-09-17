// Khởi tạo lớp Sinh viên
class Student {
    constructor(id, name, gender, dob, hometown) {
        this.id = id;
        this.name = name;
        this.gender = gender;
        this.dob = dob;
        this.hometown = hometown;
    }
}

// Lớp Quản lý sinh viên
class StudentManager {
    constructor() {
        this.students = JSON.parse(localStorage.getItem('students')) || [];
    }

    addStudent(student) {
        this.students.push(student);
        this.updateStorage();
    }

    deleteStudent(id) {
        this.students = this.students.filter(student => student.id !== id);
        this.updateStorage();
    }

    editStudent(updatedStudent) {
        const index = this.students.findIndex(student => student.id === updatedStudent.id);
        if (index !== -1) {
            this.students[index] = updatedStudent;
            this.updateStorage();
        }
    }

    updateStorage() {
        localStorage.setItem('students', JSON.stringify(this.students));
        this.render();
    }

    render() {
        const studentList = document.getElementById('student-list');
        studentList.innerHTML = '';

        this.students.forEach(student => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.gender}</td>
                <td>${student.dob}</td>
                <td>${student.hometown}</td>
                <td>
                    <button class="edit-btn" data-id="${student.id}">Sửa</button>
                    <button class="delete-btn" data-id="${student.id}">Xóa</button>
                </td>
            `;

            studentList.appendChild(tr);
        });

        // Thêm sự kiện cho nút sửa và xóa
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.deleteStudent(id);
            });
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.fillFormForEdit(id);
            });
        });
    }

    fillFormForEdit(id) {
        const student = this.students.find(student => student.id === id);
        if (student) {
            document.getElementById('studentId').value = student.id;
            document.getElementById('studentName').value = student.name;
            document.getElementById('gender').value = student.gender;
            document.getElementById('dob').value = student.dob;
            document.getElementById('hometown').value = student.hometown;
            document.getElementById('studentId').setAttribute('readonly', true);
        }
    }
}

const manager = new StudentManager();
manager.render();

document.getElementById('student-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const id = document.getElementById('studentId').value;
    const name = document.getElementById('studentName').value;
    const gender = document.getElementById('gender').value;
    const dob = document.getElementById('dob').value;
    const hometown = document.getElementById('hometown').value;

    const existingStudent = manager.students.find(student => student.id === id);

    if (existingStudent) {
        // Cập nhật sinh viên
        const updatedStudent = new Student(id, name, gender, dob, hometown);
        manager.editStudent(updatedStudent);
    } else {
        // Thêm sinh viên mới
        const newStudent = new Student(id, name, gender, dob, hometown);
        manager.addStudent(newStudent);
    }

    // Reset form
    document.getElementById('student-form').reset();
    document.getElementById('studentId').removeAttribute('readonly');
});
