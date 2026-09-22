import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import {
  BookOpen,
  PlusCircle,
  FolderPlus,
  FileText,
  Upload,
  Trash2,
  Edit,
  FileCode,
  HelpCircle,
} from 'lucide-react';

export const MaterialsManagement: React.FC = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'oqylym' | 'jazylym'>('oqylym');
  const [loading, setLoading] = useState(true);

  // Topic Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theoryContentHtml, setTheoryContentHtml] = useState('');
  const [parentTopicId, setParentTopicId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // File Upload modal
  const [uploadTopicId, setUploadTopicId] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await api.get('/theory/sections');
      setSections(res.data.sections || []);
    } catch (err) {
      console.error('Fetch sections error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const currentSection = sections.find(s => s.name === activeTab);

  const handleOpenCreate = (parentId: string | null = null) => {
    setEditingTopicId(null);
    setTitle('');
    setDescription('');
    setTheoryContentHtml('');
    setParentTopicId(parentId);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (topic: any) => {
    setEditingTopicId(topic.id);
    setTitle(topic.title);
    setDescription(topic.description || '');
    setTheoryContentHtml(topic.theoryContentHtml || '');
    setParentTopicId(topic.parentTopicId || null);
    setIsModalOpen(true);
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingTopicId) {
        await api.put(`/teacher/topics/${editingTopicId}`, {
          title,
          description,
          theoryContentHtml,
          parentTopicId,
        });
      } else {
        await api.post('/teacher/topics', {
          sectionName: activeTab,
          parentTopicId,
          title,
          description,
          theoryContentHtml,
        });
      }
      setIsModalOpen(false);
      fetchSections();
    } catch (err) {
      alert('Тақырыпты сақтау кезінде қате шықты');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTopic = async (id: string, name: string) => {
    if (!window.confirm(`«${name}» тақырыбын және оған қатысты материалдарды жоюды растайсыз ба?`)) {
      return;
    }

    try {
      await api.delete(`/teacher/topics/${id}`);
      fetchSections();
    } catch (err) {
      alert('Тақырыпты жою мүмкін болмады');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTopicId || !fileToUpload) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      await api.post(`/teacher/topics/${uploadTopicId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadTopicId(null);
      setFileToUpload(null);
      fetchSections();
    } catch (err) {
      alert('Файлды жүктеу мүмкін болмады');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Бұл файлды жоюды растайсыз ба?')) return;
    try {
      await api.delete(`/teacher/files/${fileId}`);
      fetchSections();
    } catch (err) {
      alert('Файлды жою мүмкін болмады');
    }
  };

  // Filter root topics (no parent)
  const rootTopics = currentSection?.topics?.filter((t: any) => !t.parentTopicId) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Жаттығулар мен теория</h1>
          <p className="text-xs text-slate-500 mt-1">
            Оқылым және Жазылым бөлімдерінің оқу материалдары, ережелер және мини-тесттер
          </p>
        </div>
        <button
          onClick={() => handleOpenCreate(null)}
          className="inline-flex items-center space-x-2 bg-nis-navy-800 hover:bg-nis-navy-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Жаңа негізгі тақырып қосу</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('oqylym')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'oqylym'
              ? 'bg-nis-navy-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Оқылым бөлімі</span>
        </button>

        <button
          onClick={() => setActiveTab('jazylym')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'jazylym'
              ? 'bg-nis-navy-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Жазылым бөлімі</span>
        </button>
      </div>

      {/* Topics Tree */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nis-navy-800 mx-auto" />
        </div>
      ) : rootTopics.length > 0 ? (
        <div className="space-y-4">
          {rootTopics.map((topic: any) => {
            const subTopics = currentSection?.topics?.filter((t: any) => t.parentTopicId === topic.id) || [];
            const hasQuiz = topic.quizzes && topic.quizzes.length > 0;
            const quizId = hasQuiz ? topic.quizzes[0].id : null;

            return (
              <div
                key={topic.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                {/* Topic Header Card */}
                <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-nis-navy-800 shrink-0" />
                      <h3 className="font-extrabold text-slate-900 text-base">{topic.title}</h3>
                    </div>
                    {topic.description && (
                      <p className="text-xs text-slate-500 mt-1 pl-5">{topic.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/teacher/topics/${topic.id}/quiz`}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all ${
                        hasQuiz
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                          : 'bg-nis-navy-50 hover:bg-nis-navy-100 text-nis-navy-800 border border-nis-navy-200'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{hasQuiz ? 'Тестті өңдеу' : '+ Тест құру'}</span>
                    </Link>

                    <button
                      onClick={() => setUploadTopicId(topic.id)}
                      title="Файл тіркеу"
                      className="p-1.5 rounded-xl text-slate-500 hover:text-nis-navy-800 hover:bg-slate-200/60"
                    >
                      <Upload className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenCreate(topic.id)}
                      title="Ішкі тақырыпша қосу"
                      className="p-1.5 rounded-xl text-slate-500 hover:text-nis-navy-800 hover:bg-slate-200/60"
                    >
                      <FolderPlus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(topic)}
                      title="Өңдеу"
                      className="p-1.5 rounded-xl text-slate-500 hover:text-nis-navy-800 hover:bg-slate-200/60"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTopic(topic.id, topic.title)}
                      title="Жою"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Theory Preview and Files */}
                <div className="p-6 space-y-4">
                  {topic.theoryContentHtml ? (
                    <div
                      className="prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed bg-slate-50/40 p-4 rounded-2xl border border-slate-100"
                      dangerouslySetInnerHTML={{ __html: topic.theoryContentHtml }}
                    />
                  ) : (
                    <p className="text-xs text-slate-400 italic">Теориялық мазмұн әлі жазылмаған</p>
                  )}

                  {/* Attached Files */}
                  {topic.files && topic.files.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Прикреплённые файлы:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {topic.files.map((file: any) => (
                          <div
                            key={file.id}
                            className="inline-flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs text-slate-700"
                          >
                            <FileCode className="w-3.5 h-3.5 text-nis-navy-700" />
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline font-medium"
                            >
                              {file.fileName}
                            </a>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-slate-400 hover:text-rose-600 ml-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subtopics List */}
                  {subTopics.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Ішкі тақырыптар ({subTopics.length}):
                      </p>
                      <div className="pl-4 space-y-2 border-l-2 border-nis-navy-100">
                        {subTopics.map((sub: any) => (
                          <div
                            key={sub.id}
                            className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-slate-900 text-xs">{sub.title}</span>
                              {sub.description && (
                                <p className="text-[11px] text-slate-500">{sub.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/teacher/topics/${sub.id}/quiz`}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-nis-navy-100 text-nis-navy-800 hover:bg-nis-navy-200"
                              >
                                Тест
                              </Link>
                              <button
                                onClick={() => handleOpenEdit(sub)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTopic(sub.id, sub.title)}
                                className="p-1 text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
          <p className="text-sm font-bold text-slate-700">Тақырыптар әзірге жоқ</p>
          <p className="text-xs text-slate-400 mt-1">
            Бұл бөлімге бірінші тақырыпты қосу үшін жоғарыдағы батырманы басыңыз.
          </p>
        </div>
      )}

      {/* Modal: Create/Edit Topic */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTopicId ? 'Тақырыпты өңдеу' : 'Жаңа тақырып қосу'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Тақырып атауы
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Мысалы: Мәтін стилистикасы және тілдік құралдар"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Қысқаша сипаттамасы
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Тақырып мазмұны бойынша қысқа түсінік"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Теориялық мазмұны (HTML / Текст)
            </label>
            <textarea
              rows={8}
              value={theoryContentHtml}
              onChange={e => setTheoryContentHtml(e.target.value)}
              placeholder="Теориялық ережелерді, мысалдарды және кестелерді жазыңыз..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-nis-navy-600 leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Бас тарту
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-nis-navy-800 hover:bg-nis-navy-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Сақталуда...' : 'Сақтау'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Upload file */}
      <Modal
        isOpen={!!uploadTopicId}
        onClose={() => setUploadTopicId(null)}
        title="Файл тіркеу (PDF / DOCX / PPTX / Сурет)"
      >
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50">
            <input
              type="file"
              required
              onChange={e => setFileToUpload(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-nis-navy-800 file:text-white hover:file:bg-nis-navy-700"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setUploadTopicId(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Бас тарту
            </button>
            <button
              type="submit"
              disabled={uploading || !fileToUpload}
              className="px-5 py-2 bg-nis-navy-800 hover:bg-nis-navy-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {uploading ? 'Жүктелуде...' : 'Жүктеу'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
