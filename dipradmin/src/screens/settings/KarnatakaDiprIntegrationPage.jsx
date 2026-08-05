import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ApiOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SendOutlined,
} from "@ant-design/icons";
import PageHeader from "../../components/ui/PageHeader";
import { FormCard } from "../../components/ui";
import {
  getKarnatakaConfig,
  getKarnatakaDistricts,
  publishKarnatakaNews,
  updateKarnatakaConfig,
} from "../../service/settings/KarnatakaDiprIntegrationService";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

function statusColor(status) {
  const value = String(status || "").toLowerCase();
  if (value === "connected" || value === "success") return "success";
  if (value === "auth_failed" || value === "timeout" || value.startsWith("error"))
    return "error";
  if (!value) return "default";
  return "processing";
}

function splitUrls(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v || "").trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [];
  return value
    .split(/[\n,]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function KarnatakaDiprIntegrationPage() {
  const [form] = Form.useForm();
  const [publishForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [config, setConfig] = useState(null);
  const [districts, setDistricts] = useState([]);
  const enabledWatch = Form.useWatch("enabled", form);
  const showPublish = Boolean(enabledWatch || config?.enabled);

  const applyConfig = useCallback(
    (data) => {
      setConfig(data || null);
      form.setFieldsValue({
        enabled: Boolean(data?.enabled),
        apiEndpoint:
          data?.apiEndpoint || "https://pv-api.pix.in/v1/news_house/create",
        clientSecret: "",
        timeoutMs: data?.timeoutMs || 30000,
      });
    },
    [form]
  );

  const loadDistricts = useCallback(async () => {
    try {
      const res = await getKarnatakaDistricts();
      setDistricts(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      message.error(error.message || "Failed to load districts");
    }
  }, []);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getKarnatakaConfig();
      applyConfig(res?.data);
    } catch (error) {
      console.error(error);
      message.error(error.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [applyConfig]);

  useEffect(() => {
    loadConfig();
    loadDistricts();
  }, [loadConfig, loadDistricts]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        enabled: Boolean(values.enabled),
        apiEndpoint: values.apiEndpoint,
        timeoutMs: values.timeoutMs,
      };
      if (values.clientSecret && String(values.clientSecret).trim()) {
        payload.clientSecret = String(values.clientSecret).trim();
      }
      const res = await updateKarnatakaConfig(payload);
      applyConfig(res?.data);
      message.success(res?.message || "Settings saved");
    } catch (error) {
      if (error?.errorFields) return;
      console.error(error);
      message.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!config?.enabled) {
      message.warning("Turn Enable On and click Save before publishing");
      return;
    }
    try {
      const values = await publishForm.validateFields();
      const images = splitUrls(values.images);
      const videos = splitUrls(values.videos);
      if (images.length + videos.length < 1) {
        message.error("Add at least one image or video URL");
        return;
      }
      if (images.length + videos.length > 10) {
        message.error("Maximum 10 media items allowed");
        return;
      }

      setPublishing(true);
      const payload = {
        title: String(values.title || "").trim(),
        district: values.district,
        images,
        videos,
        voiceover: String(values.voiceover || "").trim(),
      };
      if (values.script && String(values.script).trim()) {
        payload.script = String(values.script).trim();
      }

      const res = await publishKarnatakaNews(payload);
      await loadConfig();

      if (res?.skipped) {
        message.warning(res.message || "Integration disabled — publish skipped");
        return;
      }
      if (res?.success) {
        message.success("News created successfully");
        publishForm.resetFields();
      } else {
        message.error(res?.message || "Publish failed");
      }
    } catch (error) {
      if (error?.errorFields) return;
      console.error(error);
      message.error(error.message || "Failed to publish");
      await loadConfig();
    } finally {
      setPublishing(false);
    }
  };

  const districtOptions = districts.map((d) => ({
    value: d.districtName,
    label: d.districtName,
  }));

  return (
    <div style={{ maxWidth: 820 }}>
      <PageHeader
        title="Inshorts Integration"
        extra={
          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadConfig}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              style={{ background: "#005BAC" }}
            >
              Save
            </Button>
          </Space>
        }
      />

      <FormCard style={{ marginBottom: 16, padding: 20 }}>
        <Text strong style={{ display: "block", marginBottom: 12 }}>
          Status
        </Text>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <div>
            <Text type="secondary">Connection: </Text>
            <Tag color={statusColor(config?.lastStatus)} icon={<ApiOutlined />}>
              {config?.lastStatus || "not checked"}
            </Tag>
            <Tag color={config?.enabled ? "success" : "default"}>
              {config?.enabled ? "Enabled" : "Disabled"}
            </Tag>
          </div>
          <div>
            <Text type="secondary">Last checked: </Text>
            <Text>
              {config?.lastCheckedAt
                ? new Date(config.lastCheckedAt).toLocaleString()
                : "—"}
            </Text>
          </div>
          {config?.lastError ? (
            <div>
              <Text type="secondary">Last error: </Text>
              <Text type="danger">{config.lastError}</Text>
            </div>
          ) : null}
        </Space>
      </FormCard>

      <FormCard style={{ marginBottom: 16, padding: 20 }}>
        <Form form={form} layout="vertical" disabled={loading}>
          <Text strong style={{ display: "block", marginBottom: 16 }}>
            Integration
          </Text>
          <Form.Item
            label="Enable Integration"
            name="enabled"
            valuePropName="checked"
          >
            <Switch checkedChildren="On" unCheckedChildren="Off" />
          </Form.Item>

          <Form.Item name="apiEndpoint" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="clientSecret" hidden>
            <Input.Password />
          </Form.Item>
          <Form.Item name="timeoutMs" hidden>
            <InputNumber />
          </Form.Item>
        </Form>
      </FormCard>

      {showPublish ? (
        <FormCard style={{ padding: 20 }}>
          <Text strong style={{ display: "block", marginBottom: 16 }}>
            Publish
          </Text>

          {!config?.enabled ? (
            <Paragraph type="warning" style={{ marginBottom: 16 }}>
              Please click <Text strong>Save</Text> after turning Enable On.
            </Paragraph>
          ) : null}

          <Form
            form={publishForm}
            layout="vertical"
            disabled={loading || publishing}
            initialValues={{ images: [""], videos: [] }}
          >
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
                placeholder="Select district"
                options={districtOptions}
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.List name="images">
              {(fields, { add, remove }) => (
                <>
                  <Text style={{ display: "block", marginBottom: 8 }}>
                    News Images
                  </Text>
                  {fields.map((field) => (
                    <Space
                      key={field.key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...field}
                        rules={[
                          {
                            validator: (_, value) => {
                              if (!value || !String(value).trim()) {
                                return Promise.resolve();
                              }
                              try {
                                const u = new URL(String(value).trim());
                                if (u.protocol === "http:" || u.protocol === "https:") {
                                  return Promise.resolve();
                                }
                              } catch (_) {
                                // fall through
                              }
                              return Promise.reject(
                                new Error("Enter a valid link")
                              );
                            },
                          },
                        ]}
                        style={{ flex: 1, marginBottom: 0, minWidth: 280 }}
                      >
                        <Input placeholder="Paste image link" />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <MinusCircleOutlined onClick={() => remove(field.name)} />
                      ) : null}
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    style={{ marginBottom: 16 }}
                    block
                  >
                    Add another image
                  </Button>
                </>
              )}
            </Form.List>

            <Form.List name="videos">
              {(fields, { add, remove }) => (
                <>
                  <Text style={{ display: "block", marginBottom: 8 }}>
                    News Videos (optional)
                  </Text>
                  {fields.map((field) => (
                    <Space
                      key={field.key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...field}
                        rules={[
                          {
                            validator: (_, value) => {
                              if (!value || !String(value).trim()) {
                                return Promise.resolve();
                              }
                              try {
                                const u = new URL(String(value).trim());
                                if (u.protocol === "http:" || u.protocol === "https:") {
                                  return Promise.resolve();
                                }
                              } catch (_) {
                                // fall through
                              }
                              return Promise.reject(
                                new Error("Enter a valid link")
                              );
                            },
                          },
                        ]}
                        style={{ flex: 1, marginBottom: 0, minWidth: 280 }}
                      >
                        <Input placeholder="Paste video link" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    style={{ marginBottom: 16 }}
                    block
                  >
                    Add another video
                  </Button>
                </>
              )}
            </Form.List>

            <Form.Item
              label="Audio / Voiceover"
              name="voiceover"
              rules={[
                { required: true, message: "Please add the audio link" },
                { type: "url", message: "Enter a valid link" },
              ]}
            >
              <Input placeholder="Paste audio link" />
            </Form.Item>

            <Form.Item label="News Description (Kannada)" name="script">
              <TextArea
                rows={4}
                placeholder="Enter Kannada news description"
              />
            </Form.Item>

            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handlePublish}
              loading={publishing}
              disabled={!config?.enabled}
              style={{ background: "#005BAC" }}
              block
              size="large"
            >
              Publish
            </Button>
          </Form>
        </FormCard>
      ) : (
        <FormCard style={{ padding: 20 }}>
          <Text type="secondary">
            Turn <Text strong>Enable Integration</Text> On and click{" "}
            <Text strong>Save</Text> to continue.
          </Text>
        </FormCard>
      )}
    </div>
  );
}
