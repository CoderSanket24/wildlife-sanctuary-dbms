import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import api from "../../../api/axiosInstance";
import { Eyebrow, TableSkeleton, DeleteButton } from "../shared/adminComponents";

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={11} fill={i <= rating ? "#fbbf24" : "none"} style={{ color: i <= rating ? "#fbbf24" : "rgba(255,255,255,0.15)" }} />
    ))}
  </div>
);

const FeedbackTab = ({ toast }) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.get("/admin/feedback")
      .then(r => setFeedback(r.data.feedback))
      .catch(() => toast("Failed to load feedback.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const remove = async id => {
    if (!window.confirm("Delete this feedback?")) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/feedback/${id}`);
      setFeedback(v => v.filter(x => x.feedback_id !== id));
      toast("Feedback deleted.");
    } catch {
      toast("Failed to delete.", "error");
    } finally {
      setDeleting(null);
    }
  };

  const avgRating = feedback.length > 0
    ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1)
    : null;

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Eyebrow>Visitor Voice</Eyebrow>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Visitor <span style={{ color: "#fbbf24" }}>Feedback</span></h2>
          {avgRating && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/35">
              <Star size={11} fill="#fbbf24" style={{ color: "#fbbf24" }} />
              {avgRating} average · {feedback.length} {feedback.length === 1 ? "review" : "reviews"}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4"><TableSkeleton rows={3} /></div>
      ) : feedback.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-white/20">No feedback submitted yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {feedback.map(fb => (
            <div key={fb.feedback_id} className="relative flex flex-col gap-3 p-5"
              style={{ background: "linear-gradient(145deg,rgba(13,26,15,0.85) 0%,rgba(9,18,10,0.92) 100%)", borderRadius: "16px", border: "1px solid rgba(163,230,53,0.08)" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-bold text-white/80">{fb.visitor?.first_name} {fb.visitor?.last_name}</p>
                  <p className="text-[10px] text-white/28">{fb.visitor?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={fb.rating} />
                  <DeleteButton onClick={() => remove(fb.feedback_id)} disabled={deleting === fb.feedback_id} />
                </div>
              </div>
              <p className="text-[12px] leading-relaxed text-white/50">&ldquo;{fb.comments}&rdquo;</p>
              <p className="text-[10px] text-white/20">{new Date(fb.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackTab;
