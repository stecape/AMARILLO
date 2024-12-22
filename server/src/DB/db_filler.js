module.exports = function () {
  return new Promise((innerResolve, innerReject) => {
    const pg = require ('pg')
    const db_config = require('./db_config')
    const connStr = db_config.db_dialect + '://' + db_config.db_user + ':' + db_config.db_password + '@' + db_config.db_host + ':' + db_config.db_port + '/' + db_config.db_name
    var pool = new pg.Pool({connectionString: connStr})
    var queryString=`
    CREATE TABLE IF NOT EXISTS public."Field"
    (
      id SERIAL PRIMARY KEY,
      name text COLLATE pg_catalog."default" NOT NULL,
      type integer NOT NULL,
      parent_type integer NOT NULL,
      um integer,
      logic_state integer,
      comment text COLLATE pg_catalog."default"
    );
    

    CREATE TABLE IF NOT EXISTS public."Tag"
    (
      id SERIAL PRIMARY KEY,
      name text COLLATE pg_catalog."default" NOT NULL,
      var integer NOT NULL,
      parent_tag integer,
      type_field integer,
      um integer,
      logic_state integer,
      comment text COLLATE pg_catalog."default",
      value json
    );
    

    CREATE TABLE IF NOT EXISTS public."Type"
    (
      id SERIAL PRIMARY KEY,
      name text COLLATE pg_catalog."default" NOT NULL,
      base_type bool NOT NULL,
      locked bool NOT NULL
    );
        
    CREATE TABLE IF NOT EXISTS public."Device"
    (
      id SERIAL PRIMARY KEY,
      name text COLLATE pg_catalog."default" NOT NULL
    );

    CREATE TABLE IF NOT EXISTS public."Var"
    (
      id SERIAL PRIMARY KEY,
      type integer NOT NULL,
      name text COLLATE pg_catalog."default" NOT NULL,
      device integer NOT NULL,
      um integer,
      logic_state integer,
      comment text COLLATE pg_catalog."default"
    );
    

    CREATE TABLE IF NOT EXISTS public."um"
    (
      id SERIAL PRIMARY KEY,
      name text COLLATE pg_catalog."default" NOT NULL,
      metric text COLLATE pg_catalog."default" NOT NULL,
      imperial text COLLATE pg_catalog."default" NOT NULL,
      gain real NOT NULL,
      "offset" real NOT NULL
    );
    

    CREATE TABLE IF NOT EXISTS public."LogicState"
    (
        id SERIAL PRIMARY KEY,
        name text COLLATE pg_catalog."default" NOT NULL,
        value text[] COLLATE pg_catalog."default" NOT NULL
    );

    CREATE UNIQUE INDEX ui_field_name_and_parent_type 
      ON public."Field" (name, parent_type);

    ALTER TABLE IF EXISTS public."Field"
      DROP CONSTRAINT IF EXISTS field_type_id,
      ADD CONSTRAINT field_type_id FOREIGN KEY (type)
        REFERENCES public."Type" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
        NOT VALID,
      DROP CONSTRAINT IF EXISTS parent_type_id,
      ADD CONSTRAINT parent_type_id FOREIGN KEY (parent_type)
        REFERENCES public."Type" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
        NOT VALID,
      DROP CONSTRAINT IF EXISTS field_um_id,
      ADD CONSTRAINT field_um_id FOREIGN KEY (um)
        REFERENCES public."um" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
        NOT VALID,
      DROP CONSTRAINT IF EXISTS field_logic_state_id,
      ADD CONSTRAINT field_logic_state_id FOREIGN KEY (logic_state)
        REFERENCES public."LogicState" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
        NOT VALID,     
      DROP CONSTRAINT IF EXISTS unique_field_name_and_parent_type,
      ADD CONSTRAINT unique_field_name_and_parent_type UNIQUE USING INDEX ui_field_name_and_parent_type;


    CREATE UNIQUE INDEX ui_parent_tag_and_type_field 
      ON public."Tag" (parent_tag, type_field);
    
    ALTER TABLE IF EXISTS public."Tag"
      DROP CONSTRAINT IF EXISTS unique_tag_name,
      ADD CONSTRAINT unique_tag_name UNIQUE (name),
      DROP CONSTRAINT IF EXISTS parent_tag_id,
      ADD CONSTRAINT parent_tag_id FOREIGN KEY (parent_tag)
        REFERENCES public."Tag" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
        NOT VALID,
      DROP CONSTRAINT IF EXISTS var_id,
      ADD CONSTRAINT var_id FOREIGN KEY (var)
        REFERENCES public."Var" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
      DROP CONSTRAINT IF EXISTS type_field_id,
      ADD CONSTRAINT type_field_id FOREIGN KEY (type_field)
        REFERENCES public."Field" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
        NOT VALID,
      DROP CONSTRAINT IF EXISTS field_um_id,
      ADD CONSTRAINT field_um_id FOREIGN KEY (um)
        REFERENCES public."um" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
        NOT VALID,
      DROP CONSTRAINT IF EXISTS field_logic_state_id,
      ADD CONSTRAINT field_logic_state_id FOREIGN KEY (logic_state)
        REFERENCES public."LogicState" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
        NOT VALID,     
      DROP CONSTRAINT IF EXISTS unique_parent_tag_and_type_field,
      ADD CONSTRAINT unique_parent_tag_and_type_field UNIQUE USING INDEX ui_parent_tag_and_type_field;

    
    ALTER TABLE IF EXISTS public."Type"
      DROP CONSTRAINT IF EXISTS unique_type_name,
      ADD CONSTRAINT unique_type_name UNIQUE (name);

  
    ALTER TABLE IF EXISTS public."Var"
      DROP CONSTRAINT IF EXISTS unique_var_name,
      ADD CONSTRAINT unique_var_name UNIQUE (name),
      DROP CONSTRAINT IF EXISTS var_type_id,
      ADD CONSTRAINT var_type_id FOREIGN KEY (type)
        REFERENCES public."Type" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
      DROP CONSTRAINT IF EXISTS var_um_id,
      ADD CONSTRAINT var_um_id FOREIGN KEY (um)
        REFERENCES public."um" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
      DROP CONSTRAINT IF EXISTS var_device_id,
      ADD CONSTRAINT var_device_id FOREIGN KEY (device)
        REFERENCES public."Device" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
      DROP CONSTRAINT IF EXISTS var_logic_state_id,
      ADD CONSTRAINT var_logic_state_id FOREIGN KEY (logic_state)
        REFERENCES public."LogicState" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID;


    ALTER TABLE IF EXISTS public."um"
      DROP CONSTRAINT IF EXISTS unique_um_name,
      ADD CONSTRAINT unique_um_name UNIQUE (name);


    ALTER TABLE IF EXISTS public."LogicState"
      DROP CONSTRAINT IF EXISTS unique_LogicState_name,
      ADD CONSTRAINT unique_LogicState_name UNIQUE (name);


    ALTER TABLE IF EXISTS public."Device"
      DROP CONSTRAINT IF EXISTS unique_Device_id_name,
      ADD CONSTRAINT unique_Device_id_name UNIQUE (id, name);

  
    ALTER SEQUENCE IF EXISTS public."Type_id_seq"
      START 100;
    --SELECT setval('public."Type_id_seq"', 99, true);

    ALTER SEQUENCE IF EXISTS public."Field_id_seq"
      START 100;
    --SELECT setval('public."Field_id_seq"', 99, true);

    ALTER SEQUENCE IF EXISTS public."um_id_seq"
      START 100;
    --SELECT setval('public."um_id_seq"', 99, true);

    ALTER SEQUENCE IF EXISTS public."LogicState_id_seq"
      START 100;
    --SELECT setval('public."LogicState_id_seq"', 99, true);

    ALTER SEQUENCE IF EXISTS public."Device_id_seq"
      START 100;
    --SELECT setval('public."Device_id_seq"', 99, true);

    INSERT INTO "Device"(id,name) VALUES (1, 'Device_1') ON CONFLICT (id, name) DO NOTHING;

    INSERT INTO "Type"(id,name,base_type, locked) VALUES (1, 'Real', true, true) ON CONFLICT (name) DO NOTHING;
    --INSERT INTO "Type"(id,name,base_type, locked) VALUES (2, 'Text', true, true) ON CONFLICT (name) DO NOTHING; !!!!!!SPARE!!!!!!
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (3, 'Int', true, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (4, 'Bool', true, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (5, 'String', true, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (6, 'TimeStamp', true, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (7, '_Set', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (8, '_Act', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (9, '_Limit', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (10, 'Set', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (11, 'Act', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (12, 'SetAct', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (13, 'LogicSelection', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (14, 'LogicStatus', false, true) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "Type"(id,name,base_type, locked) VALUES (15, 'Alarm', false, true) ON CONFLICT (name) DO NOTHING;

    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (1, 'InputValue', 1, 7, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (2, 'Value', 1, 7, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (3, 'Value', 1, 8, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (4, 'Min', 1, 9, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (5, 'Max', 1, 9, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (6, 'Set', 7, 10, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (7, 'Limit', 9, 10, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (8, 'Act', 8, 11, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (9, 'Limit', 9, 11, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (10, 'Set', 7, 12, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (11, 'Act', 8, 12, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (12, 'Limit', 9, 12, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (13, 'Command', 3, 13, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (14, 'Status', 3, 13, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (15, 'Status', 3, 14, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (16, 'Status', 3, 15, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (17, 'Reaction', 3, 15, '') ON CONFLICT (name, parent_type) DO NOTHING;
    INSERT INTO "Field"(id, name, type, parent_type, comment) VALUES (18, 'Ts', 6, 15, '') ON CONFLICT (name, parent_type) DO NOTHING;
    
    INSERT INTO "um"(id, name, metric, imperial, gain, "offset") VALUES (1, 'm_ft', 'm', 'ft', 3.28084, 0) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "um"(id, name, metric, imperial, gain, "offset") VALUES (2, '°C_°F', '°C', '°F', 1.8, 32) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "um"(id, name, metric, imperial, gain, "offset") VALUES (3, 'Bar_psi', 'Bar', 'psi', 14.5038, 0) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "um"(id, name, metric, imperial, gain, "offset") VALUES (4, 'W', 'W', 'W', 1.0, 0) ON CONFLICT (name) DO NOTHING;
    INSERT INTO "um"(id, name, metric, imperial, gain, "offset") VALUES (5, '%', '%', '%', 1.0, 0) ON CONFLICT (name) DO NOTHING;

    -- triggers function
    -- FUNCTION: public.return_data()
    CREATE OR REPLACE FUNCTION public.return_data()
        RETURNS trigger
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE
    AS $BODY$
    DECLARE
      obj text := '';
    BEGIN 
    RAISE NOTICE 'obj: %', OLD::text;
      IF (TG_OP = 'UPDATE') THEN
      obj = '{"operation":' || to_json(TG_OP)::text || ',"table":' || to_json(TG_TABLE_NAME)::text || ',"data":' || row_to_json(NEW)::text || '}';
        PERFORM pg_notify('changes', obj);
        ELSIF (TG_OP = 'INSERT') THEN
      obj = '{"operation":' || to_json(TG_OP)::text || ',"table":' || to_json(TG_TABLE_NAME)::text || ',"data":' || row_to_json(NEW)::text || '}';
        PERFORM pg_notify('changes', obj);
        ELSIF (TG_OP = 'DELETE') THEN 
      obj = '{"operation":' || to_json(TG_OP)::text || ',"table":' || to_json(TG_TABLE_NAME)::text || ',"data":' || row_to_json(OLD)::text || '}';
        PERFORM pg_notify('changes', obj);
        ELSIF (TG_OP = 'TRUNCATE') THEN 
      obj = '{"operation":' || to_json(TG_OP)::text || ',"table":' || to_json(TG_TABLE_NAME)::text || '}';
        PERFORM pg_notify('changes', obj);
      END IF;
      RETURN NULL;
    END;
    $BODY$;

    -- triggers on Tag
    CREATE OR REPLACE TRIGGER \"TagInsertionTrigger\" AFTER INSERT ON \"Tag\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"TagUpdatingTrigger\" AFTER UPDATE ON \"Tag\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"TagDeletingTrigger\" AFTER DELETE ON \"Tag\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"TagTruncatingTrigger\" AFTER TRUNCATE ON \"Tag\" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on Device
    CREATE OR REPLACE TRIGGER \"DeviceInsertionTrigger\" AFTER INSERT ON \"Device\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"DeviceUpdatingTrigger\" AFTER UPDATE ON \"Device\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"DeviceDeletingTrigger\" AFTER DELETE ON \"Device\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"DeviceTruncatingTrigger\" AFTER TRUNCATE ON \"Device\" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on Var
    CREATE OR REPLACE TRIGGER \"VarInsertionTrigger\" AFTER INSERT ON \"Var\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"VarUpdatingTrigger\" AFTER UPDATE ON \"Var\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"VarDeletingTrigger\" AFTER DELETE ON \"Var\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"VarTruncatingTrigger\" AFTER TRUNCATE ON \"Var\" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on Type
    CREATE OR REPLACE TRIGGER \"TypeInsertionTrigger\" AFTER INSERT ON \"Type\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"TypeUpdatingTrigger\" AFTER UPDATE ON \"Type\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"TypeDeletingTrigger\" AFTER DELETE ON \"Type\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"TypeTruncatingTrigger\" AFTER TRUNCATE ON \"Type\" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on Field
    CREATE OR REPLACE TRIGGER \"FieldInsertionTrigger\" AFTER INSERT ON \"Field\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"FieldUpdatingTrigger\" AFTER UPDATE ON \"Field\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"FieldDeletingTrigger\" AFTER DELETE ON \"Field\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"FieldTruncatingTrigger\" AFTER TRUNCATE ON \"Field\" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on Um
    CREATE OR REPLACE TRIGGER \"UmInsertionTrigger\" AFTER INSERT ON \"um\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"UmUpdatingTrigger\" AFTER UPDATE ON \"um\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"UmDeletingTrigger\" AFTER DELETE ON \"um\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"UmTruncatingTrigger\" AFTER TRUNCATE ON \"um\" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
    -- triggers on LogicState
    CREATE OR REPLACE TRIGGER \"LogicStateInsertionTrigger\" AFTER INSERT ON \"LogicState\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"LogicStateUpdatingTrigger\" AFTER UPDATE ON \"LogicState\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"LogicStateDeletingTrigger\" AFTER DELETE ON \"LogicState\" FOR EACH ROW EXECUTE PROCEDURE return_data();
    CREATE OR REPLACE TRIGGER \"LogicStateTruncatingTrigger\" AFTER TRUNCATE ON \"LogicState\" FOR EACH STATEMENT EXECUTE PROCEDURE return_data();
  `
    pool.query({
      text: queryString
    })
    .then(() => {innerResolve(pool)})
    .catch(err => {
      console.log("Error during DB initialization")
      innerReject(err)
    })
    
  })
}