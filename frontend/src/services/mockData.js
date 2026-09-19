/**
 * Mock Data Fixtures conforming strictly to docs/API_CONTRACTS.md & docs/DATA_MODELS.md
 * Used for seamless local development and testing when backend endpoints are still in progress.
 */

export const MOCK_SPACES = [
  {
    id: "sp_123",
    title: "Operating Systems",
    description: "Midterm preparation notes on processes, memory management, and CPU scheduling algorithms.",
    created_at: "2026-09-19T10:00:00Z",
    document_count: 3,
    topic_count: 8,
  },
  {
    id: "sp_456",
    title: "Distributed Systems & Cloud",
    description: "Raft consensus, CAP theorem, replication topologies, and consistent hashing.",
    created_at: "2026-09-18T14:30:00Z",
    document_count: 2,
    topic_count: 5,
  },
  {
    id: "sp_789",
    title: "Database Management Systems",
    description: "ACID properties, B+ trees, relational algebra, and concurrency control isolation levels.",
    created_at: "2026-09-17T09:15:00Z",
    document_count: 4,
    topic_count: 11,
  }
];

export const MOCK_DOCUMENTS = [
  {
    id: "doc_456",
    space_id: "sp_123",
    filename: "Chapter_3_Processes.pdf",
    file_type: "pdf",
    status: "completed",
    uploaded_at: "2026-09-19T10:05:00Z",
    chunk_count: 18,
  },
  {
    id: "doc_457",
    space_id: "sp_123",
    filename: "Lecture_Notes_Process_Scheduling.txt",
    file_type: "txt",
    status: "completed",
    uploaded_at: "2026-09-19T10:12:00Z",
    chunk_count: 12,
  },
  {
    id: "doc_458",
    space_id: "sp_123",
    filename: "Memory_Paging_VirtualMemory.docx",
    file_type: "docx",
    status: "processing",
    uploaded_at: "2026-09-19T10:25:00Z",
    chunk_count: 8,
  }
];

export const MOCK_TOPICS = [
  {
    id: "top_1",
    name: "Process Management",
    summary: "Covers process states, process control blocks (PCB), life cycle, context switching, and IPC.",
    order_index: 0,
    chunk_count: 12,
    question_count: 15,
    subtopics: [
      {
        id: "top_1_1",
        parent_id: "top_1",
        name: "Process States & PCB",
        summary: "New, Ready, Running, Waiting, Terminated states and PCB register storage.",
        order_index: 0,
        chunk_count: 5,
        question_count: 7,
        subtopics: [],
      },
      {
        id: "top_1_2",
        parent_id: "top_1",
        name: "CPU Scheduling Algorithms",
        summary: "FCFS, SJF, Round Robin, Multi-level feedback queues, and Priority Scheduling.",
        order_index: 1,
        chunk_count: 7,
        question_count: 8,
        subtopics: [],
      }
    ]
  },
  {
    id: "top_2",
    name: "Memory Management & Paging",
    summary: "Logical vs physical address spaces, page tables, TLB cache, and page fault handling.",
    order_index: 1,
    chunk_count: 14,
    question_count: 12,
    subtopics: [
      {
        id: "top_2_1",
        parent_id: "top_2",
        name: "Paging & TLB Translation",
        summary: "Page table structure, offset calculation, and TLB hit/miss latency penalties.",
        order_index: 0,
        chunk_count: 8,
        question_count: 6,
        subtopics: [],
      },
      {
        id: "top_2_2",
        parent_id: "top_2",
        name: "Virtual Memory & Page Replacement",
        summary: "Demand paging, FIFO, LRU, Clock algorithm, and Thrashing prevention.",
        order_index: 1,
        chunk_count: 6,
        question_count: 6,
        subtopics: [],
      }
    ]
  },
  {
    id: "top_3",
    name: "Synchronization & Concurrency",
    summary: "Critical section problem, Peterson's solution, mutex locks, semaphores, and deadlocks.",
    order_index: 2,
    chunk_count: 9,
    question_count: 10,
    subtopics: [
      {
        id: "top_3_1",
        parent_id: "top_3",
        name: "Mutex & Semaphores",
        summary: "Counting vs binary semaphores, wait() / signal() atomicity.",
        order_index: 0,
        chunk_count: 5,
        question_count: 5,
        subtopics: [],
      },
      {
        id: "top_3_2",
        parent_id: "top_3",
        name: "Deadlock Detection & Prevention",
        summary: "Four Coffman conditions, resource allocation graphs, Banker's algorithm.",
        order_index: 1,
        chunk_count: 4,
        question_count: 5,
        subtopics: [],
      }
    ]
  }
];

export const MOCK_QUESTIONS = [
  {
    id: "q_789",
    topic_id: "top_1_1",
    type: "mcq",
    prompt: "Which component of the PCB stores the current CPU register values during a context switch?",
    options: [
      "Process state",
      "Program counter",
      "CPU registers",
      "Memory management information"
    ],
    answer: "CPU registers",
    explanation: "When an interrupt occurs, state information must be saved in the CPU registers field of the PCB so execution can resume later seamlessly.",
    difficulty: "medium",
    cognitive_level: "recall",
    source_passage: "According to Lecture 3: 'The CPU registers vary in number and type depending on the computer architecture. They include accumulators, index registers, stack pointers, and general-purpose registers along with state information.'",
    source_chunk_ids: ["chk_101"],
    is_flagged: false,
  },
  {
    id: "q_790",
    topic_id: "top_1_2",
    type: "mcq",
    prompt: "Which CPU scheduling algorithm is preemptive and assigns a fixed time quantum to each ready process?",
    options: [
      "First-Come, First-Served (FCFS)",
      "Shortest Job First (SJF)",
      "Round Robin (RR)",
      "Priority Scheduling (Non-preemptive)"
    ],
    answer: "Round Robin (RR)",
    explanation: "Round Robin defines a small unit of time called a time quantum or slice. The ready queue is treated as a circular FIFO queue.",
    difficulty: "easy",
    cognitive_level: "understanding",
    source_passage: "Section 5.3: 'Round-robin (RR) scheduling algorithm is designed especially for time-sharing systems. A small unit of time, called a time quantum (or time slice), is defined.'",
    source_chunk_ids: ["chk_104"],
    is_flagged: false,
  },
  {
    id: "q_791",
    topic_id: "top_1_2",
    type: "short_answer",
    prompt: "Explain why the Shortest Job First (SJF) scheduling algorithm cannot be implemented optimally in real general-purpose operating systems.",
    answer: "Because the exact length of the next CPU burst cannot be known in advance before the process executes; it can only be estimated using exponential smoothing.",
    explanation: "While SJF is provably optimal for minimizing average waiting time, the real OS has no crystal ball to know the next burst time ahead of time.",
    difficulty: "hard",
    cognitive_level: "application",
    source_passage: "Notes: 'The real difficulty with SJF algorithm is knowing the length of the next CPU request. For long-term scheduling, we can use process limits, but for short-term CPU scheduling, SJF cannot be implemented exactly.'",
    source_chunk_ids: ["chk_105"],
    is_flagged: false,
  },
  {
    id: "q_792",
    topic_id: "top_2_1",
    type: "mcq",
    prompt: "What is the primary function of the Translation Lookaside Buffer (TLB)?",
    options: [
      "Store disk block addresses for rapid file read",
      "Cache recent virtual-to-physical address translations to reduce memory access latency",
      "Track dirty bits for page replacement algorithms",
      "Allocate heap space dynamically for user threads"
    ],
    answer: "Cache recent virtual-to-physical address translations to reduce memory access latency",
    explanation: "The TLB is an associative high-speed hardware cache. If a page number is found in the TLB, the frame number is retrieved with zero extra main memory lookups.",
    difficulty: "medium",
    cognitive_level: "understanding",
    source_passage: "Slide 22: 'A standard memory access takes 100ns. With a two-level page table, translation requires 2 memory accesses. The TLB cuts this overhead by caching recent page-to-frame translations.'",
    source_chunk_ids: ["chk_203"],
    is_flagged: false,
  },
  {
    id: "q_793",
    topic_id: "top_3_2",
    type: "mcq",
    prompt: "Which of the following is NOT one of the four necessary Coffman conditions for deadlock?",
    options: [
      "Mutual Exclusion",
      "Hold and Wait",
      "Preemption allowed without resource revocation",
      "Circular Wait"
    ],
    answer: "Preemption allowed without resource revocation",
    explanation: "The Coffman condition is 'No Preemption' — resources cannot be preempted; a resource can be released only voluntarily by the holding process.",
    difficulty: "medium",
    cognitive_level: "recall",
    source_passage: "Chapter 7: 'Deadlock can arise if four conditions hold simultaneously: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.'",
    source_chunk_ids: ["chk_301"],
    is_flagged: false,
  }
];

export const MOCK_FLASHCARDS = [
  {
    id: "q_801",
    topic_id: "top_1_1",
    prompt: "What is a Process Control Block (PCB)?",
    answer: "A data structure maintained by the operating system containing all metadata about a specific process (PID, state, program counter, CPU registers, memory limits, and open files).",
    explanation: "PCB is the central repository of information for process management during context switching.",
    source_passage: "Notes Section 2: 'A PCB represents a process in memory and holds all state required to resume execution seamlessly.'",
  },
  {
    id: "q_802",
    topic_id: "top_1_2",
    prompt: "What is the Convoy Effect in FCFS scheduling?",
    answer: "A situation where multiple short, I/O-bound processes wait behind one long CPU-bound process, causing low CPU and device utilization.",
    explanation: "Similar to cars stuck behind a slow truck on a single-lane highway. SJF avoids this.",
    source_passage: "Section 5.2: 'The convoy effect results in lower CPU and device utilization than might be possible if the shorter processes were allowed to go first.'",
  },
  {
    id: "q_803",
    topic_id: "top_2_2",
    prompt: "What causes Thrashing in a virtual memory system?",
    answer: "Thrashing occurs when a computer spends more time paging (swapping pages in and out of disk) than executing actual program instructions, usually because the sum of working sets exceeds physical RAM.",
    explanation: "The OS sees low CPU utilization and tries to increase the multiprogramming level, making the thrashing even worse.",
    source_passage: "Lecture 8: 'If the number of frames allocated to a low-priority process falls below the minimum required by architecture, we must suspend execution. High paging activity is called thrashing.'",
  },
  {
    id: "q_804",
    topic_id: "top_3_1",
    prompt: "What is the key difference between a Binary Semaphore and a Mutex?",
    answer: "A mutex provides mutual exclusion with an ownership concept (only the locking thread can unlock it). A semaphore is a signaling mechanism without ownership (any thread can signal it).",
    explanation: "Semaphores can be used for order enforcement between threads; mutexes are specifically for lock acquisition.",
    source_passage: "Notes: 'While binary semaphores can be used like mutexes, strict mutexes enforce that only the thread that acquired the lock may release it.'",
  }
];

export const MOCK_DASHBOARD = {
  space_id: "sp_123",
  overall_mastery: 0.68,
  total_attempts: 42,
  study_streak_days: 4,
  topics: [
    {
      topic_id: "top_1_1",
      topic_name: "Process States & PCB",
      mastery: 0.88,
      label: "strong",
      attempts_count: 20,
      last_practiced_at: "2026-09-19T10:20:00Z",
    },
    {
      topic_id: "top_1_2",
      topic_name: "CPU Scheduling Algorithms",
      mastery: 0.42,
      label: "weak",
      attempts_count: 22,
      last_practiced_at: "2026-09-19T10:20:00Z",
    },
    {
      topic_id: "top_2_1",
      topic_name: "Paging & TLB Translation",
      mastery: 0.72,
      label: "developing",
      attempts_count: 14,
      last_practiced_at: "2026-09-18T16:45:00Z",
    },
    {
      topic_id: "top_2_2",
      topic_name: "Virtual Memory & Page Replacement",
      mastery: 0.45,
      label: "weak",
      attempts_count: 11,
      last_practiced_at: "2026-09-17T11:10:00Z",
    },
    {
      topic_id: "top_3_1",
      topic_name: "Mutex & Semaphores",
      mastery: 0.81,
      label: "strong",
      attempts_count: 16,
      last_practiced_at: "2026-09-19T08:30:00Z",
    },
    {
      topic_id: "top_3_2",
      topic_name: "Deadlock Detection & Prevention",
      mastery: 0.58,
      label: "developing",
      attempts_count: 9,
      last_practiced_at: "2026-09-16T15:00:00Z",
    }
  ],
  revise_next: [
    {
      topic_id: "top_1_2",
      topic_name: "CPU Scheduling Algorithms",
      mastery: 0.42,
      reason: "Accuracy below 50% on Round Robin and Priority scheduling.",
      recommended_action: "Take a 5-question targeted quiz"
    },
    {
      topic_id: "top_2_2",
      topic_name: "Virtual Memory & Page Replacement",
      mastery: 0.45,
      reason: "Last practiced 2 days ago; thrashing & page fault questions missed.",
      recommended_action: "Review flashcards & take practice test"
    }
  ],
  due_today_count: 6
};
