import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import {
  ArrowLeft,
  BookOpen,
  FileCode,
  Download,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';

export const TopicDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/theory/topics/${id}`)
        .then(res => setTopic(res.data.topic))
        .catch(err => console.error('Fetch topic detail error:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nis-navy-800" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 font-bold">Тақырып табылмады</p>
        <Link to="/student/materials" className="mt-3 text-xs text-nis-navy-700 underline">
          Материалдарға оралу
        </Link>
      </div>
    );
  }

  const quiz = topic.quizzes && topic.quizzes.length > 0 ? topic.quizzes[0] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Back button */}
      <div>
        <Link
          to="/student/materials"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-nis-navy-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Жаттығулар тізіміне оралу</span>
        </Link>
      </div>

      {/* Topic Title Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {topic.section?.title} бөлімі
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{topic.title}</h1>
        {topic.description && (
          <p className="text-sm text-slate-500 leading-relaxed pt-1">{topic.description}</p>
        )}
      </div>

      {/* Theory Content Reader */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 mb-4">
          Теориялық мазмұн
        </h2>
        {topic.theoryContentHtml ? (
          <div
            className="prose max-w-none text-slate-800 text-sm leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: topic.theoryContentHtml }}
          />
        ) : (
          <p className="text-xs text-slate-400 italic">Теория әлі толтырылмаған</p>
        )}
      </div>

      {/* Attached Files */}
      {topic.files && topic.files.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Қосымша жүктеп алу файлдары
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topic.files.map((file: any) => (
              <a
                key={file.id}
                href={file.fileUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <FileCode className="w-5 h-5 text-nis-navy-700 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-nis-navy-800">
                    {file.fileName}
                  </span>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-nis-navy-800" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Call to Action Banner */}
      {quiz ? (
        <div className="bg-gradient-to-r from-nis-navy-900 to-nis-navy-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              Білімді бекіту
            </span>
            <h3 className="text-lg font-black">{quiz.title}</h3>
            <p className="text-xs text-slate-300">
              Тақырып бойынша сұрақтар мен сәйкестендіру тапсырмалары арқылы өз біліміңізді тексеріңіз.
            </p>
          </div>

          <Link
            to={`/student/quizzes/${quiz.id}`}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black shadow-md transition-all shrink-0"
          >
            Мини-тестті бастау
          </Link>
        </div>
      ) : null}
    </div>
  );
};
