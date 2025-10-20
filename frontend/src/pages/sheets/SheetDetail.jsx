import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  Circle,
  Loader2,
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  CreditCard,
  X,
} from "lucide-react";
import useSheetStore from "../../stores/sheetStore";
import { useToastContext } from "../../contexts/ToastContext";

const SheetDetail = () => {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  const {
    currentSheet,
    loading,
    fetchSheetById,
    toggleProblemCompletion,
    createPaymentOrder,
    verifyPayment,
  } = useSheetStore();

  const [paymentModal, setPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchSheetById(sheetId);
  }, [sheetId, fetchSheetById]);

  const handleProblemClick = (problemId) => {
    if (currentSheet?.hasAccess) {
      navigate(`/problems/${problemId}`);
    }
  };

  const handleToggleCompletion = async (e, problemId) => {
    e.stopPropagation();
    try {
      await toggleProblemCompletion(sheetId, problemId);
      showSuccess("Progress updated successfully");
    } catch (error) {
      showError(error.message);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async () => {
    try {
      setProcessingPayment(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showError("Failed to load payment gateway");
        setProcessingPayment(false);
        return;
      }

      // Create order
      const orderData = await createPaymentOrder(sheetId);

      // Razorpay options
      const options = {
        key: orderData.order.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "CodeArena",
        description: orderData.sheet.title,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              sheetId: sheetId,
            });
            showSuccess("Payment successful! You now have access to this sheet.");
            setPaymentModal(false);
            fetchSheetById(sheetId);
          } catch (error) {
            showError(error.message);
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#8B5CF6",
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setPaymentModal(false);
    } catch (error) {
      showError(error.message);
      setProcessingPayment(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "text-green-400";
      case "MEDIUM":
        return "text-yellow-400";
      case "HARD":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!currentSheet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sheet not found</h2>
          <button
            onClick={() => navigate("/sheets")}
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Back to Sheets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/sheets")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Sheets</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Sheet Header */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{currentSheet.title}</h1>
                  <p className="text-gray-400">{currentSheet.description}</p>
                </div>
                {!currentSheet.hasAccess && currentSheet.type === "PREMIUM" && (
                  <Lock className="w-6 h-6 text-purple-400" />
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded-full text-sm font-medium ${getDifficultyColor(
                    currentSheet.difficulty
                  )}`}
                >
                  {currentSheet.difficulty}
                </span>
                <span className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded-full text-gray-300 text-sm font-medium">
                  {currentSheet.topic}
                </span>
              </div>
            </div>

            {/* No Access State */}
            {!currentSheet.hasAccess && (
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-8 mb-6 text-center">
                <Lock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Premium Sheet</h2>
                <p className="text-gray-300 mb-6">
                  Unlock this sheet to access all {currentSheet.problemIds?.length || 0} problems
                  and track your progress
                </p>
                <div className="mb-6">
                  <div className="text-4xl font-bold text-white mb-2">₹{currentSheet.price}</div>
                  <div className="text-gray-400 text-sm">One-time payment • Lifetime access</div>
                </div>
                <button
                  onClick={() => setPaymentModal(true)}
                  disabled={processingPayment}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Purchase Now</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Problems List */}
            {currentSheet.hasAccess && (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-xl font-bold text-white">Problems</h2>
                </div>
                <div className="divide-y divide-gray-700/50">
                  {currentSheet.problems?.map((problem, index) => (
                    <div
                      key={problem.id}
                      onClick={() => handleProblemClick(problem.id)}
                      className="p-4 hover:bg-gray-700/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => handleToggleCompletion(e, problem.id)}
                          className="flex-shrink-0"
                        >
                          {problem.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-500 group-hover:text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 font-mono text-sm">#{index + 1}</span>
                            <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">
                              {problem.title}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {problem.tags?.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span
                          className={`font-medium text-sm ${getDifficultyColor(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <BookOpen className="w-5 h-5" />
                    <span>Total Problems</span>
                  </div>
                  <span className="text-white font-bold">
                    {currentSheet.problemIds?.length || 0}
                  </span>
                </div>

                {currentSheet.hasAccess && currentSheet.progress && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Completed</span>
                      </div>
                      <span className="text-green-400 font-bold">
                        {currentSheet.progress.completed}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Target className="w-5 h-5" />
                        <span>Progress</span>
                      </div>
                      <span className="text-purple-400 font-bold">
                        {currentSheet.progress.percentage}%
                      </span>
                    </div>
                  </>
                )}

                {currentSheet.estimatedHours && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-5 h-5" />
                      <span>Est. Time</span>
                    </div>
                    <span className="text-white font-bold">{currentSheet.estimatedHours}h</span>
                  </div>
                )}
              </div>

              {currentSheet.hasAccess && currentSheet.progress && (
                <div className="mt-6">
                  <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${currentSheet.progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Prerequisites */}
            {currentSheet.prerequisites?.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Prerequisites</h3>
                <ul className="space-y-2">
                  {currentSheet.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-400">
                      <TrendingUp className="w-4 h-4 mt-1 text-purple-400 flex-shrink-0" />
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Confirm Purchase</h2>
              <button
                onClick={() => setPaymentModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">{currentSheet.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{currentSheet.description}</p>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Price</span>
                  <span className="text-2xl font-bold text-white">₹{currentSheet.price}</span>
                </div>
                <div className="text-xs text-gray-500">One-time payment • Lifetime access</div>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={processingPayment}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SheetDetail;
