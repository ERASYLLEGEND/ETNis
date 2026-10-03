# Нұсқаулық: Тегін деплой (Render + Vercel + Neon)

Бұл құжат **ET NIS Қазақ тілі** жобасын Render (Backend Express API), Vercel (Frontend React) және Neon (PostgreSQL деректер базасы) платформаларына тегін деплой жасау бойынша толық қадамдық нұсқаулықты қамтиды.

---

## 1. Neon PostgreSQL Деректер базасын баптау

1. [neon.tech](https://neon.tech) сайтына тіркеліп, жаңа жоба құрыңыз.
2. Проект жасалған соң, басқару панелінен **Connection String** көшіріңіз.
3. Форматы келесідей болады:
   ```text
   postgresql://user:password@ep-sample-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

---

## 2. Render-ге Backend деплой жасау (Express API)

1. [render.com](https://render.com) сайтына кіріп, **New -> Web Service** таңдаңыз.
2. GitHub репозиторийді (`ERASYLLEGEND/ETNis`) қосыңыз.
3. Келесі параметрлерді көрсетіңіз:
   - **Name**: `etnis-backend`
   - **Region**: Frankfurt (немесе сізге жақын)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` *(Скрипт автоматты түрде `npx prisma migrate deploy && node dist/index.js` орындайды)*

4. **Environment Variables** бөліміне келесі айнымалыларды қосыңыз:
   | Key | Value (Мысал) |
   | --- | --- |
   | `DATABASE_URL` | `postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require` |
   | `JWT_SECRET` | `et_nis_super_secret_jwt_key_2026_random_string` |
   | `CLIENT_URL` | `https://etnis.vercel.app` *(Сіздің Vercel фронтенд доменіңіз)* |
   | `PORT` | `5000` |

5. **Create Web Service** батырмасын басыңыз. Деплой аяқталған соң Render сізге backend URL ұсынады (мысалы, `https://etnis-backend.onrender.com`).

---

## 3. Vercel-ге Frontend деплой жасау (React Vite)

1. [vercel.com](https://vercel.com) сайтына кіріп, **Add New -> Project** таңдап, `ERASYLLEGEND/ETNis` репозиторийін импорттаңыз.
2. Параметрлерді баптаңыз:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables** бөлімінде қосыңыз:
   | Key | Value |
   | --- | --- |
   | `VITE_API_URL` | `https://etnis-backend.onrender.com` *(соңында слэшсіз Render домені)* |

4. **Deploy** батырмасын басыңыз.

---

## 4. Алғашқы Мұғалім аккаунтын Neon-ға қосу

Миграция сәтті өтіп, бэкэнд іске қосылған соң, мұғалім аккаунтын жасау үшін локальді компьютеріңіздегі `.env` файлында `DATABASE_URL` айнымалысын Neon сілтемесіне өзгертіп, мына пәрменді орындаңыз:

```bash
cd server
npx ts-node prisma/add-teacher.ts
```

Бұл скрипт келесі пайдаланушыны жасайды:
- **ФИО**: Абдикаримова Наргиза Сейлбековна
- **Email**: `abdikarimova_n@ptr.nis.edu.kz`
- **Пароль**: `Kazak2026` *(bcrypt хэштелген)*
- **Роль**: `teacher`

---

## 5. Заңдылық пен Тексеру (Health check)

- **Backend Health Check**: `https://etnis-backend.onrender.com/api/health`
- **Frontend App**: `https://etnis.vercel.app`
