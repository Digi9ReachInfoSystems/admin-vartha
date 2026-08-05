import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Form,
  Input,
  Select,
  Space,
  message,
} from "antd";
import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import { FormCard } from "../../components/ui";
import {
  getKarnatakaDistricts,
  markArticleCreatedLocally,
  publishKarnatakaNews,
} from "../../service/karnatakaNews/KarnatakaNewsService";

const { TextArea } = Input;

function matchDistrictOption(districtValue, districtOptions) {
  if (!districtValue) return undefined;
  const raw = String(districtValue).trim();
  const lower = raw.toLowerCase();
  const byName = districtOptions.find(
    (o) => String(o.value).toLowerCase() === lower
  );
  if (byName) return byName.value;
  const byLabel = districtOptions.find((o) =>
    String(o.label).toLowerCase().includes(lower)
  );
  return byLabel?.value || raw;
}

export default function AddKarnatakaNewsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const fromArticle = Boolean(location.state?.fromArticle);
  const sourceArticle = location.state?.article || null;
  const prefillPayload = location.state?.payload || null;

  const districtOptions = useMemo(
    () =>
      districts.map((d) => ({
        value: d.districtName,
        label: d.districtName,
      })),
    [districts]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingDistricts(true);
      try {
        const res = await getKarnatakaDistricts();
        if (mounted) setDistricts(Array.isArray(res?.data) ? res.data : []);
      } catch (error) {
        console.error(error);
        message.error(error.message || "Failed to load districts");
      } finally {
        if (mounted) setLoadingDistricts(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!prefillPayload) return;
    if (loadingDistricts) return;

    const district = matchDistrictOption(
      prefillPayload.district,
      districtOptions
    );

    form.setFieldsValue({
      title: prefillPayload.title || "",
      district: district || undefined,
      image:
        Array.isArray(prefillPayload.images) && prefillPayload.images.length
          ? prefillPayload.images[0]
          : "",
      voiceover: prefillPayload.voiceover || "",
      script: prefillPayload.script || "",
    });
  }, [prefillPayload, loadingDistricts, districtOptions, form]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const image = String(values.image || "").trim();
      if (!image) {
        message.error("Please add a news image link");
        return;
      }

      const payload = {
        title: String(values.title || "").trim(),
        district: values.district,
        images: [image],
        videos: [],
        voiceover: String(values.voiceover || "").trim(),
      };
      if (values.script && String(values.script).trim()) {
        payload.script = String(values.script).trim();
      }
      const articleId =
        prefillPayload?.articleId ||
        sourceArticle?._id ||
        sourceArticle?.id ||
        null;
      if (articleId) {
        payload.articleId = String(articleId);
      }

      setPublishing(true);
      const res = await publishKarnatakaNews(payload);

      if (res?.skipped) {
        message.warning(
          res.message || "Integration is disabled. Enable it in Settings first."
        );
        return;
      }

      if (res?.success) {
        if (articleId) {
          markArticleCreatedLocally(articleId);
        }
        message.success("News created successfully");
        navigate("/karnataka-public-news", {
          state: {
            createdArticleId: articleId || null,
            refreshMarks: true,
          },
        });
        return;
      }

      message.error(res?.message || "Create failed");
    } catch (error) {
      if (error?.errorFields) return;
      console.error(error);
      message.error(error.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  const sourceLabel =
    sourceArticle?.kannada?.title ||
    sourceArticle?.title ||
    prefillPayload?.articleId ||
    "";

  return (
    <div style={{ maxWidth: 820 }}>
      <PageHeader
        title={fromArticle ? "Confirm Create" : "Create Inshorts-News"}
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/karnataka-public-news")}
            >
              Back
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={publishing}
              onClick={handleCreate}
              style={{ background: "#005BAC" }}
            >
              {fromArticle ? "Confirm & Create" : "Create"}
            </Button>
          </Space>
        }
      />

      {fromArticle && sourceLabel ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Review and confirm"
          description={`Prefilled from: ${sourceLabel}`}
        />
      ) : null}

      <FormCard style={{ padding: 20 }}>
        <Form form={form} layout="vertical" disabled={publishing}>
          <Form.Item
            label="News Title (Kannada)"
            name="title"
            rules={[{ required: true, message: "Please enter the news title" }]}
          >
            <Input placeholder="Enter Kannada news title" />
          </Form.Item>

          <Form.Item
            label="District"
            name="district"
            rules={[{ required: true, message: "Please select a district" }]}
          >
            <Select
              showSearch
              loading={loadingDistricts}
              placeholder="Select district"
              options={districtOptions}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            label="News Image"
            name="image"
            rules={[
              { required: true, message: "Please add a news image link" },
              { type: "url", message: "Enter a valid link" },
            ]}
          >
            <Input placeholder="Paste image link" />
          </Form.Item>

          <Form.Item
            label="Audio / Voiceover"
            name="voiceover"
            rules={[
              { required: true, message: "Please add the audio link" },
              { type: "url", message: "Enter a valid link" },
            ]}
            extra={
              fromArticle && !prefillPayload?.voiceover
                ? "No audio found for this news — please add an audio link."
                : undefined
            }
          >
            <Input placeholder="Paste audio link" />
          </Form.Item>

          <Form.Item label="News Description (Kannada)" name="script">
            <TextArea
              rows={4}
              placeholder="Enter Kannada news description"
            />
          </Form.Item>
        </Form>
      </FormCard>
    </div>
  );
}
