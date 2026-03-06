function buildSeedData() {
  const now = new Date().toISOString();

  const students = [
    {
      id: 'student-1',
      name: 'Maria Silva',
      cpf: '12345678901',
      email: 'maria.silva@gymhub.com',
      phone: '11999990001',
      birthDate: '1995-03-15',
      planType: 'Premium',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'student-2',
      name: 'Joao Santos',
      cpf: '12345678902',
      email: 'joao.santos@gymhub.com',
      phone: '11999990002',
      birthDate: '1990-07-22',
      planType: 'Basico',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'student-3',
      name: 'Ana Costa',
      cpf: '12345678903',
      email: 'ana.costa@gymhub.com',
      phone: '11999990003',
      birthDate: '1988-11-30',
      planType: 'Premium',
      status: 'inactive',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const teachers = [
    {
      id: 'teacher-1',
      name: 'Ricardo Almeida',
      cpf: '98765432101',
      email: 'ricardo.almeida@gymhub.com',
      phone: '11988880001',
      specialty: 'Musculacao',
      pricePerClass: 120,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'teacher-2',
      name: 'Fernanda Souza',
      cpf: '98765432102',
      email: 'fernanda.souza@gymhub.com',
      phone: '11988880002',
      specialty: 'Pilates',
      pricePerClass: 150,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const courses = [
    {
      id: 'course-1',
      name: 'Musculacao Iniciante',
      teacherId: 'teacher-1',
      capacity: 20,
      description: 'Treino de adaptacao para novos alunos.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course-2',
      name: 'Pilates Solo',
      teacherId: 'teacher-2',
      capacity: 12,
      description: 'Aulas de pilates com foco em mobilidade.',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const classes = [
    {
      id: 'class-1',
      courseId: 'course-1',
      teacherId: 'teacher-1',
      date: '2026-04-06',
      time: '07:00',
      capacity: 20,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'class-2',
      courseId: 'course-2',
      teacherId: 'teacher-2',
      date: '2026-04-07',
      time: '18:00',
      capacity: 12,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const checkins = [
    {
      id: 'checkin-1',
      studentId: 'student-1',
      classId: 'class-1',
      checkinTime: '2026-04-06T07:01:00.000Z',
      source: 'manual',
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    students,
    teachers,
    courses,
    classes,
    checkins,
  };
}

module.exports = {
  buildSeedData,
};
